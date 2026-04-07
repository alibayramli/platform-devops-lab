import { lazy } from "react";

export const OverviewRoute = lazy(async () => {
  const module = await import("./overview-route");
  return { default: module.OverviewRoute };
});

export const OverviewPerformanceRoute = lazy(async () => {
  const module = await import("./overview-performance-route");
  return { default: module.OverviewPerformanceRoute };
});

export const TaskDetailRoute = lazy(async () => {
  const module = await import("./task-detail-route");
  return { default: module.TaskDetailRoute };
});

export const TasksBacklogRoute = lazy(async () => {
  const module = await import("./tasks-backlog-route");
  return { default: module.TasksBacklogRoute };
});

export const TasksNewRoute = lazy(async () => {
  const module = await import("./tasks-new-route");
  return { default: module.TasksNewRoute };
});

export const TeamManageRoute = lazy(async () => {
  const module = await import("./team-manage-route");
  return { default: module.TeamManageRoute };
});

export const TeamSnapshotDetailRoute = lazy(async () => {
  const module = await import("./team-snapshot-detail-route");
  return { default: module.TeamSnapshotDetailRoute };
});

export const TeamSnapshotRoute = lazy(async () => {
  const module = await import("./team-snapshot-route");
  return { default: module.TeamSnapshotRoute };
});
