import { motion } from "framer-motion";

import type { SummaryMetricId } from "../../features/teams/components/team-summary-cards";
import { TeamSummaryCards } from "../../features/teams/components/team-summary-cards";
import { TaskTable } from "../../features/tasks/components/task-table";
import type { Task, TaskStatus, TeamSummary } from "../../shared/types/api";
import { Badge } from "../../shared/ui/badge";
import { Card } from "../../shared/ui/card";
import { AnimatedRouteSection } from "../components/animated-route-section";
import { revealItem, revealItemTransition } from "../motion";

type OverviewRouteProps = {
  summary: TeamSummary | undefined;
  activeTeamName: string | null;
  tasks: Task[];
  totalTaskCount: number;
  isLoadingInitialData: boolean;
  isRefreshingTasks: boolean;
  isUpdatingTask: boolean;
  onSelectMetric: (metricId: SummaryMetricId) => void;
  onUpdateTaskStatus: (taskId: number, status: TaskStatus) => Promise<void>;
  onOpenTask: (taskId: number) => void;
};

export function OverviewRoute({
  summary,
  activeTeamName,
  tasks,
  totalTaskCount,
  isLoadingInitialData,
  isRefreshingTasks,
  isUpdatingTask,
  onSelectMetric,
  onUpdateTaskStatus,
  onOpenTask
}: OverviewRouteProps) {
  return (
    <AnimatedRouteSection>
      <motion.div variants={revealItem} transition={revealItemTransition}>
        <Card className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="section-title">Overview</h2>
              <p className="section-subtitle mt-1">
                {activeTeamName
                  ? `Live summary and latest changes for ${activeTeamName}.`
                  : "Select a workspace to load summary metrics."}
              </p>
            </div>
            <Badge variant="neutral">
              {isLoadingInitialData
                ? "Loading..."
                : isRefreshingTasks
                  ? "Refreshing tasks..."
                  : `${totalTaskCount} active tasks`}
            </Badge>
          </div>
          <TeamSummaryCards summary={summary} onSelectMetric={onSelectMetric} />
        </Card>
      </motion.div>

      {totalTaskCount > tasks.length ? (
        <motion.div variants={revealItem} transition={revealItemTransition}>
          <Card className="p-4">
            <p className="text-sm text-theme-muted">
              Showing the 8 most recently updated tasks. Open Tasks for the full backlog.
            </p>
          </Card>
        </motion.div>
      ) : null}

      <motion.div variants={revealItem} transition={revealItemTransition}>
        <TaskTable
          tasks={tasks}
          isLoading={isRefreshingTasks}
          onUpdateStatus={onUpdateTaskStatus}
          isUpdatingTask={isUpdatingTask}
          onOpenTask={onOpenTask}
        />
      </motion.div>
    </AnimatedRouteSection>
  );
}
