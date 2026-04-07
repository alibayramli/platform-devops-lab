import {
  countAssignedTasks,
  countCompletedTasks,
  countOverdueTasks,
  formatPercent,
  groupTasksByAssignee,
  isTaskOverdue
} from "../../features/tasks/lib/task-analytics";
import { getInitials } from "../../shared/lib/format";
import type { Member, Task } from "../../shared/types/api";

export type PerformanceRow = {
  key: string;
  name: string;
  subtitle: string;
  initials: string;
  primaryTaskId: number | null;
  assigned: number;
  completed: number;
  ongoing: number;
  overdue: number;
  role: string;
  health: "excellent" | "good" | "watch";
};

type PerformanceSummary = {
  assignedTasks: number;
  completedTasks: number;
  completionRate: string;
  overdueTasks: number;
};

function toTitleCase(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function buildPerformanceRows(members: Member[], tasks: Task[]): PerformanceRow[] {
  const tasksByAssignee = groupTasksByAssignee(tasks);
  const rows = members.map((member): PerformanceRow => {
    const assignedTasks = tasksByAssignee.get(member.id) ?? [];
    const completed = countCompletedTasks(assignedTasks);
    const ongoing = assignedTasks.length - completed;
    const overdue = countOverdueTasks(assignedTasks);
    const completionRatio = assignedTasks.length === 0 ? 1 : completed / assignedTasks.length;
    const health: PerformanceRow["health"] =
      overdue > 1
        ? "watch"
        : completionRatio >= 0.75
          ? "excellent"
          : completionRatio >= 0.45
            ? "good"
            : "watch";

    return {
      key: `member-${member.id}`,
      name: member.fullName,
      subtitle: member.email,
      initials: getInitials(member.fullName),
      primaryTaskId: assignedTasks[0]?.id ?? null,
      assigned: assignedTasks.length,
      completed,
      ongoing,
      overdue,
      role: toTitleCase(member.role),
      health
    };
  });

  const unassignedTasks = tasks.filter((task) => task.assigneeId == null);

  if (unassignedTasks.length > 0) {
    rows.push({
      key: "unassigned-queue",
      name: "Unassigned Queue",
      subtitle: "Tasks waiting for ownership",
      initials: "UQ",
      primaryTaskId: unassignedTasks[0]?.id ?? null,
      assigned: unassignedTasks.length,
      completed: 0,
      ongoing: unassignedTasks.length,
      overdue: unassignedTasks.filter((task) => isTaskOverdue(task)).length,
      role: "Operations",
      health: unassignedTasks.length > 2 ? "watch" : "good"
    });
  }

  return rows.sort((left, right) => right.assigned - left.assigned);
}

export function buildPerformanceSummary(tasks: Task[]): PerformanceSummary {
  const assignedTasks = countAssignedTasks(tasks);
  const completedTasks = countCompletedTasks(tasks);
  const overdueTasks = countOverdueTasks(tasks);
  const completionRate =
    tasks.length === 0 ? formatPercent(0) : formatPercent((completedTasks / tasks.length) * 100);

  return {
    assignedTasks,
    completedTasks,
    completionRate,
    overdueTasks
  };
}
