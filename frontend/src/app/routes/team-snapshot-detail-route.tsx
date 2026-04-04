import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import type { SummaryMetricId } from "../../features/teams/components/team-summary-cards";
import { summaryMetricDefinitions } from "../../features/teams/summary-metrics";
import { TaskTable } from "../../features/tasks/components/task-table";
import type { Member, Task, TaskStatus } from "../../shared/types/api";
import { Badge } from "../../shared/ui/badge";
import { Button } from "../../shared/ui/button";
import { Card } from "../../shared/ui/card";
import { snapshotMetricConfig } from "../config";
import { AnimatedRouteSection } from "../components/animated-route-section";
import { revealItem, revealItemTransition } from "../motion";

type TeamSnapshotDetailRouteProps = {
  activeTeamName: string | null;
  members: Member[];
  tasks: Task[];
  isLoadingTasks: boolean;
  onUpdateTaskStatus: (taskId: number, status: TaskStatus) => Promise<void>;
  isUpdatingTask: boolean;
  onOpenTask: (taskId: number) => void;
};

export function TeamSnapshotDetailRoute({
  activeTeamName,
  members,
  tasks,
  isLoadingTasks,
  onUpdateTaskStatus,
  isUpdatingTask,
  onOpenTask
}: TeamSnapshotDetailRouteProps) {
  const navigate = useNavigate();
  const params = useParams();
  const rawMetric = params.metric;

  const metric =
    rawMetric && Object.prototype.hasOwnProperty.call(snapshotMetricConfig, rawMetric)
      ? (rawMetric as SummaryMetricId)
      : null;
  const metricConfig = metric ? snapshotMetricConfig[metric] : null;
  const metricDefinition = metric ? summaryMetricDefinitions[metric] : null;

  const visibleTasks = useMemo(() => {
    if (!metric || metric === "members") {
      return [];
    }

    if (metricConfig?.statusFilter) {
      return tasks.filter((task) => task.status === metricConfig.statusFilter);
    }

    return tasks;
  }, [metric, metricConfig?.statusFilter, tasks]);

  if (!metric || !metricConfig) {
    return <Navigate to="/team/snapshot" replace />;
  }

  return (
    <AnimatedRouteSection className="dashboard-route-stack">
      <motion.div variants={revealItem} transition={revealItemTransition}>
        <Card className="detail-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="section-title flex items-center gap-2">
                {metricDefinition ? (
                  <metricDefinition.icon size={16} color="var(--text-soft)" />
                ) : null}
                {metricConfig.title}
              </h2>
              <p className="section-subtitle mt-1">
                {metricConfig.description}
                {activeTeamName ? ` Workspace: ${activeTeamName}.` : ""}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                void navigate("/team/snapshot");
              }}
            >
              <ArrowLeft size={14} />
              Back To Snapshot
            </Button>
          </div>
        </Card>
      </motion.div>

      {metric === "members" ? (
        <motion.div variants={revealItem} transition={revealItemTransition}>
          <Card className="stack-panel space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="section-title text-base">Member Directory</h3>
              <Badge variant="neutral">{members.length} members</Badge>
            </div>

            {members.length === 0 ? (
              <div className="surface empty-state">No members found for this workspace.</div>
            ) : (
              <ul className="member-list">
                {members.map((member) => (
                  <li key={member.id} className="member-item surface">
                    <div className="min-w-0">
                      <p className="row-title">{member.fullName}</p>
                      <p className="row-subtitle">{member.email}</p>
                    </div>
                    <Badge variant={member.role === "lead" ? "sunrise" : "neutral"}>
                      {member.role}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={revealItem} transition={revealItemTransition}>
          <TaskTable
            tasks={visibleTasks}
            isLoading={isLoadingTasks}
            onUpdateStatus={onUpdateTaskStatus}
            isUpdatingTask={isUpdatingTask}
            onOpenTask={onOpenTask}
          />
        </motion.div>
      )}
    </AnimatedRouteSection>
  );
}
