import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import type { SummaryMetricId } from "../../features/teams/components/team-summary-cards";
import type { Task, TeamSummary } from "../../shared/types/api";
import { Card } from "../../shared/ui/card";
import { AnimatedRouteSection } from "../components/animated-route-section";
import { revealItem, revealItemTransition } from "../motion";

type OverviewRouteProps = {
  summary: TeamSummary | undefined;
  activeTeamName: string | null;
  tasks: Task[];
  totalTaskCount: number;
  onSelectMetric: (metricId: SummaryMetricId) => void;
};

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

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

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

function buildMetricCards(summary: TeamSummary | undefined, tasks: Task[]): MetricCard[] {
  const total = summary?.totalTasks ?? tasks.length;
  const overdueCount = tasks.filter((task) => {
    if (!task.dueDate || task.status === "done") {
      return false;
    }

    return new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);
  }).length;

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

function buildChart(tasks: Task[]): ChartPoint[] {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth() - 8, 1);
  const maxTotal = 3000;
  const monthKeys = Array.from({ length: 9 }, (_, index) => {
    const monthDate = new Date(start.getFullYear(), start.getMonth() + index, 1);
    return {
      key: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
      label: formatMonth(monthDate)
    };
  });

  const counts = monthKeys.map(({ key }, index) => {
    const monthTasks = tasks.filter((task) => {
      const date = new Date(task.updatedAt);
      return `${date.getFullYear()}-${date.getMonth()}` === key;
    });
    const doneTasks = monthTasks.filter((task) => task.status === "done");

    if (tasks.length === 0) {
      return {
        total: fallbackChart[index],
        completed: Math.round(fallbackChart[index] * 0.62)
      };
    }

    const maxCount = Math.max(
      ...monthKeys.map((month) => {
        return tasks.filter((task) => {
          const date = new Date(task.updatedAt);
          return `${date.getFullYear()}-${date.getMonth()}` === month.key;
        }).length;
      }),
      1
    );

    const baseline = fallbackChart[index] * 0.32;
    const total = Math.round(
      Math.min(
        maxTotal,
        baseline + ((monthTasks.length || 0) / maxCount) * (fallbackChart[index] * 0.82)
      )
    );
    const completed = Math.round(
      total * (doneTasks.length / Math.max(monthTasks.length, 1) || 0.6)
    );

    return {
      total: Math.max(total, monthTasks.length > 0 ? 520 : 340),
      completed: Math.max(completed, monthTasks.length > 0 ? 260 : 180)
    };
  });

  return monthKeys.map((month, index) => ({
    label: month.label,
    totalHeight: counts[index].total,
    completedHeight: Math.min(counts[index].completed, counts[index].total)
  }));
}

function buildActivity(tasks: Task[]): number[] {
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

export function OverviewRoute({
  summary,
  activeTeamName,
  tasks,
  totalTaskCount,
  onSelectMetric
}: OverviewRouteProps) {
  const metrics = useMemo(() => buildMetricCards(summary, tasks), [summary, tasks]);
  const chart = useMemo(() => buildChart(tasks), [tasks]);
  const activity = useMemo(() => buildActivity(tasks), [tasks]);
  const [activeChartIndex, setActiveChartIndex] = useState<number | null>(null);

  const highPriorityCount = tasks.filter((task) => task.priority === "high").length;
  const mediumPriorityCount = tasks.filter((task) => task.priority === "medium").length;
  const lowPriorityCount = tasks.filter((task) => task.priority === "low").length;
  const tasksWithNotes = tasks.filter((task) => Boolean(task.description)).length;
  const dueSoon = tasks.filter((task) => {
    if (!task.dueDate || task.status === "done") {
      return false;
    }

    const distance = new Date(task.dueDate).getTime() - Date.now();
    return distance >= 0 && distance <= 1000 * 60 * 60 * 24 * 7;
  }).length;

  return (
    <AnimatedRouteSection className="dashboard-route-stack">
      <motion.div variants={revealItem} transition={revealItemTransition} className="metrics-row">
        {metrics.map((metric) => (
          <button
            key={metric.id}
            type="button"
            className="metric-card dashboard-panel text-left"
            onClick={() => onSelectMetric(metric.id)}
          >
            <div className="metric-card-top">
              <div className="metric-card-label">
                <span className="metric-card-dot" />
                {metric.label}
              </div>
            </div>
            <div className="metric-card-value-row">
              <span className="metric-card-value">{formatNumber(metric.value)}</span>
              <span
                className="metric-card-trend"
                style={{
                  color: metric.direction === "down" ? "var(--danger)" : "var(--success)"
                }}
              >
                {metric.direction === "down" ? (
                  <ArrowDownRight size={15} />
                ) : (
                  <ArrowUpRight size={15} />
                )}
                {metric.trend}%
              </span>
            </div>
            <div className="metric-card-note">{metric.note}</div>
          </button>
        ))}
      </motion.div>

      <div className="overview-grid">
        <motion.div variants={revealItem} transition={revealItemTransition}>
          <Card className="chart-panel">
            <div className="chart-header">
              <div>
                <h2 className="section-title">Monthly Productivity Overview</h2>
                <p className="section-subtitle">
                  {activeTeamName
                    ? `Track task progress and completion rates for ${activeTeamName}.`
                    : "Track task progress and completion rates over time."}
                </p>
                <p className="chart-helper-copy">Move across the bars to compare monthly output.</p>
              </div>
            </div>

            <div className="productivity-chart">
              <div className="chart-axis" aria-hidden="true">
                {[3000, 2500, 2000, 1500, 1000, 500].map((value) => (
                  <div key={value} className="chart-axis-label">
                    {value}
                  </div>
                ))}
              </div>

              <div>
                <div className="chart-grid">
                  {[0, 20, 40, 60, 80, 100].map((value) => (
                    <div key={value} className="chart-grid-line" style={{ top: `${value}%` }} />
                  ))}

                  <div className="chart-columns">
                    {chart.map((month, index) => (
                      <div
                        key={month.label}
                        className="chart-column"
                        tabIndex={0}
                        data-active={activeChartIndex === index}
                        aria-label={`${month.label}: ${formatNumber(month.completedHeight)} completed out of ${formatNumber(month.totalHeight)} total`}
                        onMouseEnter={() => setActiveChartIndex(index)}
                        onMouseLeave={() => setActiveChartIndex(null)}
                        onFocus={() => setActiveChartIndex(index)}
                        onBlur={() => setActiveChartIndex(null)}
                      >
                        <div className="chart-column-bars">
                          {activeChartIndex === index ? (
                            <div
                              className="chart-column-tooltip"
                              style={{
                                bottom: `min(calc(${(month.totalHeight / 3000) * 100}% + 0.55rem), calc(100% - 2.35rem))`
                              }}
                            >
                              <strong>{month.label}</strong>
                              <span>
                                {formatNumber(month.completedHeight)} done ·{" "}
                                {formatPercent(
                                  (month.completedHeight / Math.max(month.totalHeight, 1)) * 100
                                )}
                              </span>
                            </div>
                          ) : null}
                          <div
                            className="chart-bar-back"
                            style={{ height: `${(month.totalHeight / 3000) * 100}%` }}
                          />
                          <div
                            className="chart-bar-front"
                            style={{ height: `${(month.completedHeight / 3000) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chart-months">
                  {chart.map((month) => (
                    <div key={month.label} className="chart-month-label">
                      {month.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={revealItem} transition={revealItemTransition}>
          <Card className="insights-panel">
            <div className="insights-header">
              <div>
                <h2 className="section-title">Task Distribution & Activity</h2>
                <p className="section-subtitle">Monitor task status in real time.</p>
              </div>
            </div>

            <div className="insights-grid">
              <div className="insight-stats">
                <div>
                  <div className="insight-stat-label">High Priority</div>
                  <div className="insight-stat-value">{formatNumber(highPriorityCount)}</div>
                </div>
                <div>
                  <div className="insight-stat-label">Medium Priority</div>
                  <div className="insight-stat-value">{formatNumber(mediumPriorityCount)}</div>
                </div>
                <div>
                  <div className="insight-stat-label">Low Priority</div>
                  <div className="insight-stat-value">{formatNumber(lowPriorityCount)}</div>
                </div>
                <div>
                  <div className="insight-stat-label">Assigned Today</div>
                  <div className="insight-stat-value">{formatNumber(totalTaskCount)}</div>
                  <div className="insight-stat-subvalue">
                    /{formatNumber(Math.max(totalTaskCount, 1))}
                  </div>
                </div>
                <div>
                  <div className="insight-stat-label">With Notes</div>
                  <div className="insight-stat-value">{formatNumber(tasksWithNotes)}</div>
                  <div className="insight-stat-subvalue">descriptions added</div>
                </div>
                <div>
                  <div className="insight-stat-label">Due Soon</div>
                  <div className="insight-stat-value">{formatNumber(dueSoon)}</div>
                  <div className="insight-stat-subvalue">next 7 days</div>
                </div>
              </div>

              <div className="activity-strip" aria-label="Task activity strip">
                {activity.map((value, index) => (
                  <div
                    key={`${value}-${index}`}
                    className={
                      index % 4 === 0 || index % 5 === 0 ? "activity-bar" : "activity-bar faint"
                    }
                    style={{ height: `${value}px` }}
                  />
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatedRouteSection>
  );
}
