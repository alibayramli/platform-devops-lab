import cors from "cors";
import express from "express";

import { healthRouter } from "./modules/health/health.routes.js";
import { membersRouter } from "./modules/members/members.routes.js";
import { tasksRouter } from "./modules/tasks/tasks.routes.js";
import { teamsRouter } from "./modules/teams/teams.routes.js";
import {
  getMetricsSnapshot,
  metricsContentType,
  metricsMiddleware
} from "./observability/metrics.js";
import { requestLogger } from "./observability/request-logger.js";
import { asyncHandler } from "./shared/async-handler.js";
import { errorMiddleware } from "./shared/error-middleware.js";

export const app = express();

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

app.use(healthRouter);
app.use("/api", teamsRouter);
app.use("/api", membersRouter);
app.use("/api", tasksRouter);

app.use(errorMiddleware);
