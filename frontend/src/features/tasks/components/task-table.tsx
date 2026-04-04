import { Check, MoreHorizontal } from "lucide-react";

import { taskStatuses, type Task, type TaskStatus } from "../../../shared/types/api";
import { Badge } from "../../../shared/ui/badge";
import { Button } from "../../../shared/ui/button";
import { Card } from "../../../shared/ui/card";
import { Select } from "../../../shared/ui/select";

type TaskTableProps = {
  tasks: Task[];
  isLoading?: boolean;
  onUpdateStatus: (taskId: number, status: TaskStatus) => Promise<void>;
  isUpdatingTask: boolean;
  onOpenTask?: (taskId: number) => void;
};

function prettyStatus(status: TaskStatus): string {
  return status.replace("_", " ");
}

function resolveInitials(value: string | null): string {
  if (!value) {
    return "NA";
  }

  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function resolvePriorityVariant(priority: Task["priority"]): "danger" | "sunrise" | "deep" {
  switch (priority) {
    case "high":
      return "danger";
    case "medium":
      return "sunrise";
    case "low":
      return "deep";
  }
}

function resolveStatusVariant(status: TaskStatus): "deep" | "sunrise" | "danger" | "mint" {
  switch (status) {
    case "todo":
      return "deep";
    case "in_progress":
      return "sunrise";
    case "blocked":
      return "danger";
    case "done":
      return "mint";
  }
}

export function TaskTable({
  tasks,
  isLoading = false,
  onUpdateStatus,
  isUpdatingTask,
  onOpenTask
}: TaskTableProps) {
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

      <div className="table-shell">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th aria-label="Selected" />
              <th>Task</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assignee</th>
              <th>Due Date</th>
              <th>Updated</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => (
              <tr key={task.id}>
                <td>
                  <span className={`checkbox-pill ${index < 3 ? "is-checked" : ""}`}>
                    <Check size={12} />
                  </span>
                </td>
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
                        {prettyStatus(statusValue)}
                      </option>
                    ))}
                  </Select>
                </td>
                <td>
                  <Badge variant={resolvePriorityVariant(task.priority)}>{task.priority}</Badge>
                </td>
                <td>
                  <div className="row-identity">
                    <span
                      className="avatar"
                      style={{ height: "2.25rem", width: "2.25rem", fontSize: ".72rem" }}
                    >
                      {resolveInitials(task.assigneeName)}
                    </span>
                    <div className="row-identity-text">
                      <span className="row-title">{task.assigneeName ?? "Unassigned"}</span>
                      <span className="row-subtitle">
                        {task.assigneeName ? "Task owner" : "Assign from backlog"}
                      </span>
                    </div>
                  </div>
                </td>
                <td>{task.dueDate ?? "-"}</td>
                <td>
                  <div className="row-identity-text">
                    <Badge variant={resolveStatusVariant(task.status)}>
                      {prettyStatus(task.status)}
                    </Badge>
                    <span className="row-subtitle">
                      {new Date(task.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    {onOpenTask ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onOpenTask(task.id)}
                      >
                        Open
                      </Button>
                    ) : null}
                    <button type="button" className="table-icon-button" aria-label="Task actions">
                      <MoreHorizontal size={16} />
                    </button>
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
