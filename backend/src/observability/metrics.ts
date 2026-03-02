import type { NextFunction, Request, Response } from "express";
import client from "prom-client";

import { env } from "../config/env.js";

const metricsRegistry = new client.Registry();
metricsRegistry.setDefaultLabels({
  service: env.APP_NAME,
  env: env.NODE_ENV
});

client.collectDefaultMetrics({ register: metricsRegistry });

const httpRequestCounter = new client.Counter({
  name: "http_server_requests_total",
  help: "Total number of HTTP requests served by the API",
  labelNames: ["method", "route", "status_code"],
  registers: [metricsRegistry]
});

const httpRequestDurationHistogram = new client.Histogram({
  name: "http_server_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.6, 1, 2, 5],
  registers: [metricsRegistry]
});

function getRouteLabel(req: Request): string {
  const route = req.route as { path?: unknown } | undefined;
  const routePath = route?.path;

  if (typeof routePath === "string") {
    return `${req.baseUrl}${routePath}` || routePath;
  }

  return "unmatched";
}

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const durationSeconds = Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;
    const route = getRouteLabel(req);
    const statusCode = res.statusCode.toString();
    const method = req.method.toUpperCase();

    httpRequestCounter.inc({ method, route, status_code: statusCode });
    httpRequestDurationHistogram.observe(
      { method, route, status_code: statusCode },
      durationSeconds
    );
  });

  next();
}

export async function getMetricsSnapshot(): Promise<string> {
  return metricsRegistry.metrics();
}

export const metricsContentType = metricsRegistry.contentType;
