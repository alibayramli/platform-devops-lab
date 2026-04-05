import { ClipboardList, LayoutDashboard, UsersRound } from "lucide-react";

import type { SummaryMetricId } from "../features/teams/components/team-summary-cards";
import type { SnapshotMetricConfigEntry, WorkspaceView } from "./types";

export const selectedTeamStorageKey = "team-task-hub:selected-team-id";
export const selectedThemeStorageKey = "team-task-hub:theme";

export const viewRoutes: WorkspaceView[] = [
  {
    id: "overview",
    label: "Overview",
    path: "/overview",
    description: "Workspace pulse and latest delivery changes.",
    icon: LayoutDashboard
  },
  {
    id: "tasks",
    label: "Tasks",
    path: "/tasks/backlog",
    description: "Backlog, filters, and task delivery flow.",
    icon: ClipboardList
  },
  {
    id: "team",
    label: "Teams",
    path: "/teams",
    description: "Global team management, workspace setup, and member access.",
    icon: UsersRound
  }
];

export const snapshotMetricConfig: Record<SummaryMetricId, SnapshotMetricConfigEntry> = {
  tasks: {
    title: "All Tasks",
    description: "Full task list for the selected workspace."
  },
  todo: {
    title: "To Do Tasks",
    description: "Tasks that are ready to start.",
    statusFilter: "todo"
  },
  in_progress: {
    title: "In Progress Tasks",
    description: "Tasks currently being worked on.",
    statusFilter: "in_progress"
  },
  blocked: {
    title: "Blocked Tasks",
    description: "Tasks waiting on a dependency or decision.",
    statusFilter: "blocked"
  },
  done: {
    title: "Done Tasks",
    description: "Completed tasks for this workspace.",
    statusFilter: "done"
  },
  members: {
    title: "Members",
    description: "Roster details and ownership structure."
  }
};
