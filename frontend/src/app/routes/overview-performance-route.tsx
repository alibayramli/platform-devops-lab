import { useMemo } from "react";
import { motion } from "framer-motion";

import { formatNumber } from "../../shared/lib/format";
import type { Member, Task } from "../../shared/types/api";
import { Button } from "../../shared/ui/button";
import { Badge } from "../../shared/ui/badge";
import { Card } from "../../shared/ui/card";
import { AnimatedRouteSection } from "../components/animated-route-section";
import { revealItem, revealItemTransition } from "../motion";
import { buildPerformanceRows, buildPerformanceSummary } from "./overview-performance.helpers";

type OverviewPerformanceRouteProps = {
  activeTeamName: string | null;
  members: Member[];
  tasks: Task[];
  isLoadingInitialData: boolean;
  isRefreshingTasks: boolean;
  onOpenTask: (taskId: number) => void;
};

export function OverviewPerformanceRoute({
  activeTeamName,
  members,
  tasks,
  isLoadingInitialData,
  isRefreshingTasks,
  onOpenTask
}: OverviewPerformanceRouteProps) {
  const performanceRows = useMemo(() => buildPerformanceRows(members, tasks), [members, tasks]);
  const performanceSummary = useMemo(() => buildPerformanceSummary(tasks), [tasks]);

  return (
    <AnimatedRouteSection className="dashboard-route-stack">
      <motion.div variants={revealItem} transition={revealItemTransition}>
        <Card className="stack-panel space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="section-title">Team Performance Tracker</h2>
              <p className="section-subtitle mt-1">
                {activeTeamName
                  ? `Review workload, delivery progress, and ownership across ${activeTeamName}.`
                  : "Review workload, delivery progress, and ownership across the active workspace."}
              </p>
            </div>
            <Badge variant="neutral">{performanceRows.length} entries</Badge>
          </div>

          <div className="admin-summary-grid performance-summary-grid">
            <div className="surface admin-summary-card">
              <div className="detail-stat-label">Members</div>
              <div className="admin-summary-value">{formatNumber(members.length)}</div>
              <div className="admin-summary-copy">People available for assignment.</div>
            </div>
            <div className="surface admin-summary-card">
              <div className="detail-stat-label">Assigned Tasks</div>
              <div className="admin-summary-value">
                {formatNumber(performanceSummary.assignedTasks)}
              </div>
              <div className="admin-summary-copy">Work items currently owned by a teammate.</div>
            </div>
            <div className="surface admin-summary-card">
              <div className="detail-stat-label">Completion Rate</div>
              <div className="admin-summary-value">{performanceSummary.completionRate}</div>
              <div className="admin-summary-copy">Share of tasks already marked done.</div>
            </div>
            <div className="surface admin-summary-card">
              <div className="detail-stat-label">Overdue Tasks</div>
              <div className="admin-summary-value">
                {formatNumber(performanceSummary.overdueTasks)}
              </div>
              <div className="admin-summary-copy">Tasks that need attention right away.</div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={revealItem} transition={revealItemTransition}>
        <Card className="table-panel">
          {isLoadingInitialData ? (
            <div className="surface empty-state">Loading team performance data...</div>
          ) : performanceRows.length === 0 ? (
            <div className="surface empty-state">
              Add members and tasks to populate the performance tracker.
            </div>
          ) : (
            <div className="table-shell table-shell-performance-detail">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Assigned</th>
                    <th>Completed</th>
                    <th>Ongoing</th>
                    <th>Overdue</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceRows.map((row) => (
                    <tr key={row.key}>
                      <td>
                        <div className="row-identity">
                          <span
                            className="avatar"
                            style={{ height: "2.5rem", width: "2.5rem", fontSize: ".8rem" }}
                          >
                            {row.initials}
                          </span>
                          <div className="row-identity-text">
                            <span className="row-title">{row.name}</span>
                            <span className="row-subtitle">{row.subtitle}</span>
                          </div>
                        </div>
                      </td>
                      <td>{row.assigned} Task</td>
                      <td>{row.completed} Task</td>
                      <td>{row.ongoing} Task</td>
                      <td>{row.overdue} Task</td>
                      <td>{row.role}</td>
                      <td>
                        <span className={`status-chip ${row.health}`}>
                          {row.health === "excellent"
                            ? "Excellent"
                            : row.health === "good"
                              ? "Good"
                              : "Watch"}
                        </span>
                      </td>
                      <td>
                        {row.primaryTaskId ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const taskId = row.primaryTaskId;

                              if (typeof taskId === "number") {
                                onOpenTask(taskId);
                              }
                            }}
                          >
                            Open
                          </Button>
                        ) : (
                          <span className="row-subtitle">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {isRefreshingTasks ? (
            <p className="section-subtitle" style={{ marginTop: "0.9rem" }}>
              Refreshing workload data...
            </p>
          ) : null}
        </Card>
      </motion.div>
    </AnimatedRouteSection>
  );
}
