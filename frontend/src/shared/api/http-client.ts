const envApiUrl: unknown = import.meta.env.VITE_API_URL;
const apiBaseUrl =
  typeof envApiUrl === "string" && envApiUrl.length > 0 ? envApiUrl : "http://localhost:8080";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const maybeJson = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(maybeJson?.error ?? `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
