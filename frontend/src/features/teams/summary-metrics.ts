import type { LucideIcon } from "lucide-react";
import {
  CircleCheckBig,
  ClipboardList,
  ListTodo,
  OctagonAlert,
  TimerReset,
  UsersRound
} from "lucide-react";

import type { TeamSummary } from "../../shared/types/api";

export type SummaryMetricId = "tasks" | "todo" | "in_progress" | "blocked" | "done" | "members";

export type SummaryMetricDefinition = {
  label: string;
  icon: LucideIcon;
};

export const summaryMetricDefinitions: Record<SummaryMetricId, SummaryMetricDefinition> = {
  tasks: { label: "Tasks", icon: ClipboardList },
  todo: { label: "To Do", icon: ListTodo },
  in_progress: { label: "In Progress", icon: TimerReset },
  blocked: { label: "Blocked", icon: OctagonAlert },
  done: { label: "Done", icon: CircleCheckBig },
  members: { label: "Members", icon: UsersRound }
};

export const summaryMetricOrder: SummaryMetricId[] = [
  "tasks",
  "todo",
  "in_progress",
  "blocked",
  "done",
  "members"
];

export function resolveSummaryMetricValue(
  metricId: SummaryMetricId,
  summary: TeamSummary | undefined
): number {
  if (!summary) {
    return 0;
  }

  switch (metricId) {
    case "tasks":
      return summary.totalTasks;
    case "todo":
      return summary.todo;
    case "in_progress":
      return summary.inProgress;
    case "blocked":
      return summary.blocked;
    case "done":
      return summary.done;
    case "members":
      return summary.memberCount;
  }
}
