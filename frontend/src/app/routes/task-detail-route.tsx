import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { TaskFormFields } from "../../features/tasks/components/task-form-fields";
import {
  createTaskFormValues,
  type TaskFormValues,
  type UpdateTaskInput
} from "../../features/tasks/types";
import { buildUpdateTaskInput } from "../../features/tasks/utils";
import type { Member, Task } from "../../shared/types/api";
import { formatDateTime } from "../../shared/lib/format";
import { Button } from "../../shared/ui/button";
import { Card } from "../../shared/ui/card";
import { useConfirmationDialog } from "../../shared/ui/use-confirmation-dialog";
import { AnimatedRouteSection } from "../components/animated-route-section";
import { revealItem, revealItemTransition } from "../motion";

type TaskDetailRouteProps = {
  tasks: Task[];
  members: Member[];
  isLoadingTasks: boolean;
  onUpdateTask: (taskId: number, patch: UpdateTaskInput) => Promise<void>;
  onDeleteTask: (taskId: number) => Promise<void>;
  isUpdatingTask: boolean;
  isDeletingTask: boolean;
};

export function TaskDetailRoute({
  tasks,
  members,
  isLoadingTasks,
  onUpdateTask,
  onDeleteTask,
  isUpdatingTask,
  isDeletingTask
}: TaskDetailRouteProps) {
  const confirm = useConfirmationDialog();
  const navigate = useNavigate();
  const params = useParams();
  const rawTaskId = params.taskId ?? "";
  const taskId = Number(rawTaskId);
  const [values, setValues] = useState<TaskFormValues>(() => createTaskFormValues());

  const isValidTaskId = Number.isInteger(taskId) && taskId > 0;

  const task = useMemo(() => {
    if (!isValidTaskId) {
      return null;
    }

    return tasks.find((entry) => entry.id === taskId) ?? null;
  }, [isValidTaskId, taskId, tasks]);

  useEffect(() => {
    if (!task) {
      return;
    }

    setValues(createTaskFormValues(task));
  }, [task]);

  if (!isValidTaskId) {
    return <Navigate to="/tasks/backlog" replace />;
  }

  async function handleSave() {
    if (!task) {
      return;
    }

    const patch = buildUpdateTaskInput(values);

    if (!patch) {
      return;
    }

    await onUpdateTask(task.id, patch);
  }

  async function handleDelete() {
    if (!task) {
      return;
    }

    const confirmed = await confirm({
      title: "Delete task?",
      description: `This will permanently delete "${task.title}" from the workspace backlog.`,
      confirmLabel: "Delete Task",
      tone: "danger"
    });

    if (!confirmed) {
      return;
    }

    await onDeleteTask(task.id);
    void navigate("/tasks/backlog");
  }

  return (
    <AnimatedRouteSection className="dashboard-route-stack">
      {!task && isLoadingTasks ? (
        <motion.div variants={revealItem} transition={revealItemTransition}>
          <Card className="detail-card">
            <p className="section-subtitle">Loading task details...</p>
          </Card>
        </motion.div>
      ) : null}

      {!task && !isLoadingTasks ? (
        <motion.div variants={revealItem} transition={revealItemTransition}>
          <Card className="detail-card space-y-4">
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
          <Card className="detail-card space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="section-title">Task #{task.id}</h2>
                <p className="section-subtitle mt-1">
                  Last updated {formatDateTime(task.updatedAt)}
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

            <div className="task-creator-form">
              <TaskFormFields
                members={members}
                values={values}
                descriptionClassName="task-creator-description"
                onChange={(field, value) =>
                  setValues((currentValues) => ({
                    ...currentValues,
                    [field]: value
                  }))
                }
                sideFooter={
                  <div className="panel-actions">
                    <Button
                      type="button"
                      variant="primary"
                      size="lg"
                      disabled={isUpdatingTask}
                      onClick={() => {
                        void handleSave();
                      }}
                    >
                      <Save size={16} />
                      {isUpdatingTask ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      disabled={isDeletingTask}
                      onClick={() => {
                        void handleDelete();
                      }}
                    >
                      <Trash2 size={16} />
                      {isDeletingTask ? "Deleting..." : "Delete Task"}
                    </Button>
                  </div>
                }
              />
            </div>
          </Card>
        </motion.div>
      ) : null}
    </AnimatedRouteSection>
  );
}
