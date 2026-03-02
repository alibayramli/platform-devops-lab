import type { LucideIcon } from "lucide-react";

import type { TaskStatus } from "../shared/types/api";

export type Theme = "light" | "dark";
export type WorkspaceViewId = "overview" | "tasks" | "team";

export type WorkspaceView = {
  id: WorkspaceViewId;
  label: string;
  path: string;
  icon: LucideIcon;
  description: string;
};

export type SnapshotMetricConfigEntry = {
  title: string;
  description: string;
  statusFilter?: TaskStatus;
};
