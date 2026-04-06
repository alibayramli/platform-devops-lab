import cors from "cors";
import express from "express";

import { registerAppRouters } from "./modules/index.js";
import {
  getMetricsSnapshot,
  metricsContentType,
  metricsMiddleware
} from "./observability/metrics.js";
import { requestLogger } from "./observability/request-logger.js";
import { asyncHandler } from "./shared/async-handler.js";
import { errorMiddleware } from "./shared/error-middleware.js";
import { notFoundMiddleware } from "./shared/not-found-middleware.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);
  app.use(metricsMiddleware);

  app.get("/", (_req, res) => {
    res.json({ name: "Team Task Hub API", status: "ok" });
  });

  app.get(
    "/metrics",
    asyncHandler(async (_req, res) => {
      const metrics = await getMetricsSnapshot();
      res.setHeader("Content-Type", metricsContentType);
      res.send(metrics);
    })
  );

  registerAppRouters(app);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}

export const app = createApp();
