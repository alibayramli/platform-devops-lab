import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import {
  taskPriorities,
  taskStatuses,
  type Member,
  type Task,
  type TaskPriority,
  type TaskStatus
} from "../../shared/types/api";
import { Button } from "../../shared/ui/button";
import { Card } from "../../shared/ui/card";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Select } from "../../shared/ui/select";
import { Textarea } from "../../shared/ui/textarea";
import { AnimatedRouteSection } from "../components/animated-route-section";
import { revealItem, revealItemTransition } from "../motion";

type TaskDetailRouteProps = {
  tasks: Task[];
  members: Member[];
  isLoadingTasks: boolean;
  onUpdateTask: (
    taskId: number,
    patch: Partial<{
      title: string;
      description: string | null;
      status: TaskStatus;
      priority: TaskPriority;
      dueDate: string | null;
      assigneeId: number | null;
    }>
  ) => Promise<void>;
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
  const navigate = useNavigate();
  const params = useParams();
  const rawTaskId = params.taskId ?? "";
  const taskId = Number(rawTaskId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assigneeId, setAssigneeId] = useState<number | "">("");
  const [dueDate, setDueDate] = useState("");

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

    setTitle(task.title);
    setDescription(task.description ?? "");
    setStatus(task.status);
    setPriority(task.priority);
    setAssigneeId(task.assigneeId ?? "");
    setDueDate(task.dueDate ?? "");
  }, [task]);

  if (!isValidTaskId) {
    return <Navigate to="/tasks/backlog" replace />;
  }

  async function handleSave() {
    if (!task) {
      return;
    }

    const cleanTitle = title.trim();

    if (!cleanTitle) {
      return;
    }

    await onUpdateTask(task.id, {
      title: cleanTitle,
      description: description.trim() || null,
      status,
      priority,
      dueDate: dueDate || null,
      assigneeId: typeof assigneeId === "number" ? assigneeId : null
    });
  }

  async function handleDelete() {
    if (!task) {
      return;
    }

    const confirmed = window.confirm(`Delete "${task.title}"?`);

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

            <div className="task-creator-form">
              <div className="task-creator-main">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Task title"
                    maxLength={140}
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Task notes, blockers, and context"
                    maxLength={800}
                    className="task-creator-description"
                  />
                </div>
              </div>

              <div className="task-creator-side">
                <div className="task-creator-meta-grid">
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={status}
                      onChange={(event) => setStatus(event.target.value as TaskStatus)}
                    >
                      {taskStatuses.map((statusValue) => (
                        <option key={statusValue} value={statusValue}>
                          {statusValue}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={priority}
                      onChange={(event) => setPriority(event.target.value as TaskPriority)}
                    >
                      {taskPriorities.map((priorityValue) => (
                        <option key={priorityValue} value={priorityValue}>
                          {priorityValue}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label>Assignee</Label>
                    <Select
                      value={assigneeId}
                      onChange={(event) =>
                        setAssigneeId(event.target.value ? Number(event.target.value) : "")
                      }
                    >
                      <option value="">Unassigned</option>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.fullName}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(event) => setDueDate(event.target.value)}
                      className="ui-input-date"
                    />
                  </div>
                </div>

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
              </div>
            </div>
          </Card>
        </motion.div>
      ) : null}
    </AnimatedRouteSection>
  );
}
