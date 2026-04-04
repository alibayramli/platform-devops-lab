import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { NavLink } from "react-router-dom";

import { TaskCreator } from "../../features/tasks/components/task-creator";
import type { Member } from "../../shared/types/api";
import { Card } from "../../shared/ui/card";
import { AnimatedRouteSection } from "../components/animated-route-section";
import { revealItem, revealItemTransition } from "../motion";

type CreateTaskInput = {
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "blocked" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  assigneeId?: number | null;
  createdByMemberId?: number | null;
};

type TasksNewRouteProps = {
  members: Member[];
  isCreatingTask: boolean;
  onCreateTask: (input: CreateTaskInput) => Promise<void>;
};

export function TasksNewRoute({ members, isCreatingTask, onCreateTask }: TasksNewRouteProps) {
  return (
    <AnimatedRouteSection className="dashboard-route-stack">
      <motion.div variants={revealItem} transition={revealItemTransition}>
        <Card className="form-card flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="section-title">Create Task</h2>
            <p className="section-subtitle">Capture a new task and assign ownership.</p>
          </div>
          <NavLink to="/tasks/backlog" className="ui-button ui-button-outline ui-button-md">
            <ArrowLeft size={14} />
            Backlog
          </NavLink>
        </Card>
      </motion.div>

      <motion.div variants={revealItem} transition={revealItemTransition}>
        <TaskCreator
          members={members}
          onCreateTask={onCreateTask}
          isCreatingTask={isCreatingTask}
        />
      </motion.div>
    </AnimatedRouteSection>
  );
}
