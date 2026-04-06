import { Trash2 } from "lucide-react";

import { taskStatuses, type Task, type TaskStatus } from "../../../shared/types/api";
import { formatShortDate, getInitials } from "../../../shared/lib/format";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button";
import { Card } from "../../../shared/ui/card";
import { Select } from "../../../shared/ui/select";
import { useConfirmationDialog } from "../../../shared/ui/use-confirmation-dialog";
import {
  formatTaskStatusLabel,
  resolveTaskPriorityVariant,
  resolveTaskStatusVariant
} from "../utils";

type TaskTableProps = {
  tasks: Task[];
  isLoading?: boolean;
  onUpdateStatus: (taskId: number, status: TaskStatus) => Promise<void>;
  isUpdatingTask: boolean;
  onDeleteTask: (taskId: number) => Promise<void>;
  isDeletingTask: boolean;
  onOpenTask?: (taskId: number) => void;
};

export function TaskTable({
  tasks,
  isLoading = false,
  onUpdateStatus,
  isUpdatingTask,
  onDeleteTask,
  isDeletingTask,
  onOpenTask
}: TaskTableProps) {
  const confirm = useConfirmationDialog();

  async function handleDelete(task: Task) {
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
  }

  if (tasks.length === 0) {
    return (
      <Card className="table-panel">
        <div className="table-toolbar">
          <div>
            <h2 className="section-title">Tasks</h2>
            <p className="section-subtitle">Review and update the current backlog.</p>
          </div>
          <Badge variant="neutral">{isLoading ? "Loading..." : "0 items"}</Badge>
        </div>

        <div className="surface empty-state">
          {isLoading ? "Loading tasks..." : "No tasks matched the current filters."}
        </div>
      </Card>
    );
  }

  return (
    <Card className="table-panel">
      <div className="table-toolbar">
        <div>
          <h2 className="section-title">Tasks</h2>
          <p className="section-subtitle">Delivery board with status updates and task details.</p>
        </div>
        <Badge variant="neutral">{isLoading ? "Refreshing..." : `${tasks.length} items`}</Badge>
      </div>

      <div className="table-shell table-shell-records">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assignee</th>
              <th>Due Date</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>
                  <div className="row-identity">
                    <span
                      className="avatar"
                      style={{ height: "2.45rem", width: "2.45rem", fontSize: ".78rem" }}
                    >
                      {String(task.id).padStart(2, "0")}
                    </span>
                    <div className="row-identity-text">
                      <span className="row-title">{task.title}</span>
                      <span className="row-subtitle">
                        {task.description ?? "No description provided"}
                      </span>
                    </div>
                  </div>
                </td>
                <td style={{ minWidth: "12rem" }}>
                  <Select
                    value={task.status}
                    disabled={isUpdatingTask}
                    onChange={(event) => {
                      void onUpdateStatus(task.id, event.target.value as TaskStatus);
                    }}
                  >
                    {taskStatuses.map((statusValue) => (
                      <option key={statusValue} value={statusValue}>
                        {formatTaskStatusLabel(statusValue)}
                      </option>
                    ))}
                  </Select>
                </td>
                <td>
                  <Badge variant={resolveTaskPriorityVariant(task.priority)}>{task.priority}</Badge>
                </td>
                <td>
                  <div className="row-identity">
                    <span
                      className="avatar"
                      style={{ height: "2.25rem", width: "2.25rem", fontSize: ".72rem" }}
                    >
                      {getInitials(task.assigneeName)}
                    </span>
                    <div className="row-identity-text">
                      <span className="row-title">{task.assigneeName ?? "Unassigned"}</span>
                      <span className="row-subtitle">
                        {task.assigneeName ? "Task owner" : "Assign from task details"}
                      </span>
                    </div>
                  </div>
                </td>
                <td>{task.dueDate ?? "-"}</td>
                <td>
                  <div className="row-identity-text">
                    <Badge variant={resolveTaskStatusVariant(task.status)}>
                      {formatTaskStatusLabel(task.status)}
                    </Badge>
                    <span className="row-subtitle">{formatShortDate(task.updatedAt)}</span>
                  </div>
                </td>
                <td>
                  <div className="table-row-actions">
                    {onOpenTask ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onOpenTask(task.id);
                        }}
                      >
                        Open
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isDeletingTask}
                      onClick={() => {
                        void handleDelete(task);
                      }}
                    >
                      <Trash2 size={14} />
                      {isDeletingTask ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
