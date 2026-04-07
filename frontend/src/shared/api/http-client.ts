const envApiUrl: unknown = import.meta.env.VITE_API_URL;
const apiBaseUrl =
  typeof envApiUrl === "string" && envApiUrl.length > 0 ? envApiUrl : "http://localhost:8080";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  timeoutMs?: number;
};

type ParsedErrorBody = {
  error?: string;
  message?: string;
};

export class ApiError extends Error {
  status: number;
  path: string;
  method: string;
  details: unknown;

  constructor(
    message: string,
    options: { status: number; path: string; method: string; details?: unknown }
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.path = options.path;
    this.method = options.method;
    this.details = options.details;
  }
}

function serializeRequestBody(body: unknown): { body: BodyInit | undefined; headers: HeadersInit } {
  if (body === undefined) {
    return {
      body: undefined,
      headers: {}
    };
  }

  if (
    typeof body === "string" ||
    body instanceof Blob ||
    body instanceof FormData ||
    body instanceof URLSearchParams
  ) {
    return {
      body,
      headers: {}
    };
  }

  return {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json"
    }
  };
}

function createRequestSignal(
  signal: AbortSignal | null | undefined,
  timeoutMs: number | undefined
) {
  if (!timeoutMs) {
    return {
      didTimeout: () => false,
      signal,
      stop: () => {}
    };
  }

  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const abortFromParent = () => {
    controller.abort();
  };

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", abortFromParent, { once: true });
    }
  }

  return {
    didTimeout: () => timedOut,
    signal: controller.signal,
    stop: () => {
      window.clearTimeout(timeoutId);
      signal?.removeEventListener("abort", abortFromParent);
    }
  };
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (
    response.status === 204 ||
    response.status === 205 ||
    response.headers.get("Content-Length") === "0"
  ) {
    return undefined;
  }

  const contentType = response.headers.get("Content-Type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  const text = await response.text().catch(() => "");
  return text || null;
}

function resolveErrorMessage(response: Response, body: unknown): string {
  if (typeof body === "string" && body.trim().length > 0) {
    return body;
  }

  if (typeof body === "object" && body !== null) {
    const parsedBody = body as ParsedErrorBody;

    if (typeof parsedBody.error === "string" && parsedBody.error.length > 0) {
      return parsedBody.error;
    }

    if (typeof parsedBody.message === "string" && parsedBody.message.length > 0) {
      return parsedBody.message;
    }
  }

  return `Request failed with status ${response.status}`;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body: rawBody, timeoutMs, ...requestInit } = options;
  const method = requestInit.method ?? "GET";
  const { body, headers: bodyHeaders } = serializeRequestBody(rawBody);
  const { didTimeout, signal, stop } = createRequestSignal(requestInit.signal, timeoutMs);

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...requestInit,
      method,
      headers: {
        Accept: "application/json",
        ...bodyHeaders,
        ...(requestInit.headers ?? {})
      },
      signal,
      body
    });
    const responseBody = await parseResponseBody(response);

    if (!response.ok) {
      throw new ApiError(resolveErrorMessage(response, responseBody), {
        status: response.status,
        path,
        method,
        details: responseBody
      });
    }

    return responseBody as T;
  } catch (error) {
    if (didTimeout()) {
      throw new ApiError(`Request timed out after ${timeoutMs}ms`, {
        status: 408,
        path,
        method
      });
    }

    throw error;
  } finally {
    stop();
  }
}
