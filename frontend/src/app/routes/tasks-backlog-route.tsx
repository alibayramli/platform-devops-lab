import { motion } from "framer-motion";

import { TaskFiltersBar } from "../../features/tasks/components/task-filters";
import { TaskTable } from "../../features/tasks/components/task-table";
import type { Member, Task, TaskFilters, TaskStatus } from "../../shared/types/api";
import { Badge } from "../../shared/ui/badge";
import { Card } from "../../shared/ui/card";
import { AnimatedRouteSection } from "../components/animated-route-section";
import { revealItem, revealItemTransition } from "../motion";

type TasksBacklogRouteProps = {
  members: Member[];
  filters: TaskFilters;
  tasks: Task[];
  isLoadingTasks: boolean;
  isUpdatingTask: boolean;
  isDeletingTask: boolean;
  onChangeFilters: (nextFilters: TaskFilters) => void;
  onUpdateTaskStatus: (taskId: number, status: TaskStatus) => Promise<void>;
  onDeleteTask: (taskId: number) => Promise<void>;
  onOpenTask: (taskId: number) => void;
};

export function TasksBacklogRoute({
  members,
  filters,
  tasks,
  isLoadingTasks,
  isUpdatingTask,
  isDeletingTask,
  onChangeFilters,
  onUpdateTaskStatus,
  onDeleteTask,
  onOpenTask
}: TasksBacklogRouteProps) {
  return (
    <AnimatedRouteSection className="dashboard-route-stack">
      <motion.div variants={revealItem} transition={revealItemTransition}>
        <Card className="form-card space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="section-title">Task Backlog</h2>
              <p className="section-subtitle">
                Refine and update tasks by status, priority, owner, and text search.
              </p>
            </div>
            <Badge variant="neutral">{tasks.length} tasks</Badge>
          </div>
          <TaskFiltersBar members={members} filters={filters} onChangeFilters={onChangeFilters} />
        </Card>
      </motion.div>

      <motion.div variants={revealItem} transition={revealItemTransition}>
        <TaskTable
          tasks={tasks}
          isLoading={isLoadingTasks}
          onUpdateStatus={onUpdateTaskStatus}
          isUpdatingTask={isUpdatingTask}
          onDeleteTask={onDeleteTask}
          isDeletingTask={isDeletingTask}
          onOpenTask={onOpenTask}
        />
      </motion.div>
    </AnimatedRouteSection>
  );
}
