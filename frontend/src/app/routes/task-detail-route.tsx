import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { taskStatuses, type Task, type TaskStatus } from "../../shared/types/api";
import { Button } from "../../shared/ui/button";
import { Card } from "../../shared/ui/card";
import { Select } from "../../shared/ui/select";
import { AnimatedRouteSection } from "../components/animated-route-section";
import { revealItem, revealItemTransition } from "../motion";

type TaskDetailRouteProps = {
  tasks: Task[];
  isLoadingTasks: boolean;
  onUpdateTaskStatus: (taskId: number, status: TaskStatus) => Promise<void>;
  isUpdatingTask: boolean;
};

export function TaskDetailRoute({
  tasks,
  isLoadingTasks,
  onUpdateTaskStatus,
  isUpdatingTask
}: TaskDetailRouteProps) {
  const navigate = useNavigate();
  const params = useParams();
  const rawTaskId = params.taskId ?? "";
  const taskId = Number(rawTaskId);

  const isValidTaskId = Number.isInteger(taskId) && taskId > 0;

  const task = useMemo(() => {
    if (!isValidTaskId) {
      return null;
    }

    return tasks.find((entry) => entry.id === taskId) ?? null;
  }, [isValidTaskId, taskId, tasks]);

  if (!isValidTaskId) {
    return <Navigate to="/tasks/backlog" replace />;
  }

  return (
    <AnimatedRouteSection>
      {!task && isLoadingTasks ? (
        <motion.div variants={revealItem} transition={revealItemTransition}>
          <Card>
            <p className="text-sm text-theme-muted">Loading task details...</p>
          </Card>
        </motion.div>
      ) : null}

      {!task && !isLoadingTasks ? (
        <motion.div variants={revealItem} transition={revealItemTransition}>
          <Card className="space-y-4">
            <div>
              <h2 className="section-title">Task Not Found</h2>
              <p className="section-subtitle mt-1">
                The selected task does not exist in the active workspace.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void navigate("/tasks/backlog");
              }}
            >
              <ArrowLeft size={14} />
              Back To Backlog
            </Button>
          </Card>
        </motion.div>
      ) : null}

      {task ? (
        <motion.div variants={revealItem} transition={revealItemTransition}>
          <Card className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="section-title">Task #{task.id}</h2>
                <p className="section-subtitle mt-1">
                  Last updated {new Date(task.updatedAt).toLocaleString()}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  void navigate("/tasks/backlog");
                }}
              >
                <ArrowLeft size={14} />
                Back To Backlog
              </Button>
            </div>

            <div className="surface grid gap-3 rounded-2xl p-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-theme-muted">
                  Title
                </p>
                <p className="mt-1 text-sm font-semibold text-theme-primary">{task.title}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-theme-muted">
                  Assignee
                </p>
                <p className="mt-1 text-sm text-theme-primary">
                  {task.assigneeName ?? "Unassigned"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-theme-muted">
                  Priority
                </p>
                <p className="mt-1 text-sm text-theme-primary">{task.priority}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-theme-muted">
                  Due Date
                </p>
                <p className="mt-1 text-sm text-theme-primary">{task.dueDate ?? "-"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-theme-muted">
                  Description
                </p>
                <p className="mt-1 text-sm text-theme-primary">
                  {task.description ?? "No description"}
                </p>
              </div>
            </div>

            <div className="max-w-[220px]">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-theme-muted">
                Status
              </p>
              <Select
                value={task.status}
                disabled={isUpdatingTask}
                onChange={(event) => {
                  void onUpdateTaskStatus(task.id, event.target.value as TaskStatus);
                }}
              >
                {taskStatuses.map((statusValue) => (
                  <option key={statusValue} value={statusValue}>
                    {statusValue}
                  </option>
                ))}
              </Select>
            </div>
          </Card>
        </motion.div>
      ) : null}
    </AnimatedRouteSection>
  );
}
