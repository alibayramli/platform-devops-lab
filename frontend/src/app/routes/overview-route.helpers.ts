import type { SummaryMetricId } from "../../features/teams/components/team-summary-cards";
import { countOverdueTasks } from "../../features/tasks/lib/task-analytics";
import type { Task, TeamSummary } from "../../shared/types/api";

type ChartPoint = {
  label: string;
  totalHeight: number;
  completedHeight: number;
};

type MetricCard = {
  id: SummaryMetricId;
  label: string;
  value: number;
  trend: number;
  note: string;
  direction: "up" | "down";
};

const fallbackActivity = [38, 64, 52, 56, 72, 61, 53, 42, 64, 39, 66, 48, 41, 47, 55, 63, 51, 58];
const fallbackChart = [720, 2200, 1800, 1920, 2550, 2060, 1780, 1520, 2220];
const maxChartHeight = 3000;

function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
}

function getRelativeNote(metricId: SummaryMetricId): string {
  switch (metricId) {
    case "done":
      return "Tasks finished this cycle";
    case "in_progress":
      return "Currently being worked on";
    case "todo":
      return "Tasks awaiting review";
    case "blocked":
      return "Missed or blocked this month";
    case "tasks":
      return "Tasks assigned this month";
    case "members":
      return "Active collaborators";
  }
}

function getMetricTrend(value: number, total: number, inverse = false): number {
  if (total === 0) {
    return 0;
  }

  const percentage = Math.max(4, Math.round((value / total) * 100));
  return inverse ? Math.max(3, 24 - Math.round(percentage / 3)) : Math.min(percentage, 32);
}

export function buildMetricCards(summary: TeamSummary | undefined, tasks: Task[]): MetricCard[] {
  const total = summary?.totalTasks ?? tasks.length;
  const overdueCount = countOverdueTasks(tasks);

  return [
    {
      id: "done",
      label: "Tasks Completed",
      value: summary?.done ?? 0,
      trend: getMetricTrend(summary?.done ?? 0, total),
      note: getRelativeNote("done"),
      direction: "up"
    },
    {
      id: "in_progress",
      label: "Tasks In Progress",
      value: summary?.inProgress ?? 0,
      trend: getMetricTrend(summary?.inProgress ?? 0, total),
      note: getRelativeNote("in_progress"),
      direction: "up"
    },
    {
      id: "todo",
      label: "Pending Approvals",
      value: summary?.todo ?? 0,
      trend: getMetricTrend(summary?.todo ?? 0, total),
      note: getRelativeNote("todo"),
      direction: "up"
    },
    {
      id: "blocked",
      label: "Overdue Tasks",
      value: overdueCount,
      trend: getMetricTrend(overdueCount, Math.max(total, 1), true),
      note: getRelativeNote("blocked"),
      direction: overdueCount > 0 ? "down" : "up"
    },
    {
      id: "tasks",
      label: "New Tasks Assigned",
      value: total,
      trend: getMetricTrend(total, Math.max(total, 1)),
      note: getRelativeNote("tasks"),
      direction: "up"
    }
  ];
}

export function buildChart(tasks: Task[]): ChartPoint[] {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth() - 8, 1);
  const monthKeys = Array.from({ length: 9 }, (_, index) => {
    const monthDate = new Date(start.getFullYear(), start.getMonth() + index, 1);
    return {
      key: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
      label: formatMonth(monthDate)
    };
  });

  if (tasks.length === 0) {
    return monthKeys.map((month, index) => ({
      label: month.label,
      totalHeight: fallbackChart[index],
      completedHeight: Math.round(fallbackChart[index] * 0.62)
    }));
  }

  const countsByMonth = new Map<string, { total: number; completed: number }>();

  for (const task of tasks) {
    const date = new Date(task.updatedAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const current = countsByMonth.get(key) ?? { total: 0, completed: 0 };

    current.total += 1;

    if (task.status === "done") {
      current.completed += 1;
    }

    countsByMonth.set(key, current);
  }

  const maxCount = Math.max(...Array.from(countsByMonth.values(), (count) => count.total), 1);

  return monthKeys.map((month, index) => {
    const monthCounts = countsByMonth.get(month.key) ?? { total: 0, completed: 0 };
    const baseline = fallbackChart[index] * 0.32;
    const totalHeight = Math.round(
      Math.min(
        maxChartHeight,
        baseline + (monthCounts.total / maxCount) * (fallbackChart[index] * 0.82)
      )
    );
    const minimumTotalHeight = monthCounts.total > 0 ? 520 : 340;
    const resolvedTotalHeight = Math.max(totalHeight, minimumTotalHeight);
    const completedHeight = Math.round(
      resolvedTotalHeight * (monthCounts.completed / Math.max(monthCounts.total, 1) || 0.6)
    );

    return {
      label: month.label,
      totalHeight: resolvedTotalHeight,
      completedHeight: Math.min(
        Math.max(completedHeight, monthCounts.total > 0 ? 260 : 180),
        resolvedTotalHeight
      )
    };
  });
}

export function buildActivity(tasks: Task[]): number[] {
  if (tasks.length === 0) {
    return fallbackActivity;
  }

  const weighted = tasks.reduce<number[]>(
    (accumulator, task, index) => {
      const slot = index % 18;
      const weight = task.priority === "high" ? 24 : task.priority === "medium" ? 18 : 12;
      accumulator[slot] = (accumulator[slot] ?? 0) + weight;
      return accumulator;
    },
    Array.from({ length: 18 }, () => 0)
  );

  const maxValue = Math.max(...weighted, 1);

  return weighted.map((value, index) => {
    const baseline = fallbackActivity[index];
    return Math.max(12, Math.round(baseline * 0.45 + (value / maxValue) * 52));
  });
}
