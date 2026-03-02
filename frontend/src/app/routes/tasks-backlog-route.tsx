import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { Plus } from "lucide-react";

import { TaskFiltersBar } from "../../features/tasks/components/task-filters";
import { TaskTable } from "../../features/tasks/components/task-table";
import type { Member, Task, TaskFilters, TaskStatus } from "../../shared/types/api";
import { Card } from "../../shared/ui/card";
import { AnimatedRouteSection } from "../components/animated-route-section";
import { revealItem, revealItemTransition } from "../motion";

type TasksBacklogRouteProps = {
  members: Member[];
  filters: TaskFilters;
  tasks: Task[];
  isLoadingTasks: boolean;
  isUpdatingTask: boolean;
  onChangeFilters: (nextFilters: TaskFilters) => void;
  onUpdateTaskStatus: (taskId: number, status: TaskStatus) => Promise<void>;
  onOpenTask: (taskId: number) => void;
};

export function TasksBacklogRoute({
  members,
  filters,
  tasks,
  isLoadingTasks,
  isUpdatingTask,
  onChangeFilters,
  onUpdateTaskStatus,
  onOpenTask
}: TasksBacklogRouteProps) {
  return (
    <AnimatedRouteSection>
      <motion.div variants={revealItem} transition={revealItemTransition}>
        <Card className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="section-title">Task Backlog</h2>
              <p className="section-subtitle">
                Refine and update tasks by status, priority, owner, and text search.
              </p>
            </div>
            <NavLink to="/tasks/new" className="workspace-action-link">
              <Plus size={15} />
              New Task
            </NavLink>
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
          onOpenTask={onOpenTask}
        />
      </motion.div>
    </AnimatedRouteSection>
  );
}
