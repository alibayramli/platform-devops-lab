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

function statusVariant(status: TaskStatus): "deep" | "sunrise" | "danger" | "mint" {
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
      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="section-title">Tasks</h2>
          <Badge variant="neutral">{isLoading ? "Loading..." : "0 items"}</Badge>
        </div>

        <div className="surface px-4 py-10 text-center text-sm text-theme-muted">
          {isLoading ? "Loading tasks..." : "No tasks matched the current filters."}
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="section-title">Tasks</h2>
        <Badge variant="neutral">{isLoading ? "Refreshing..." : `${tasks.length} items`}</Badge>
      </div>

      <div className="table-shell">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead className="table-head text-xs uppercase tracking-wide">
            <tr>
              <th className="px-3 py-3 text-left font-semibold">Task</th>
              <th className="px-3 py-3 text-left font-semibold">Status</th>
              <th className="px-3 py-3 text-left font-semibold">Priority</th>
              <th className="px-3 py-3 text-left font-semibold">Assignee</th>
              <th className="px-3 py-3 text-left font-semibold">Due Date</th>
              <th className="px-3 py-3 text-left font-semibold">Updated</th>
              <th className="px-3 py-3 text-left font-semibold">Details</th>
            </tr>
          </thead>
          <tbody className="bg-transparent">
            {tasks.map((task) => (
              <tr key={task.id} className="table-row border-t first:border-t-0">
                <td className="px-3 py-3">
                  <p className="font-semibold text-theme-primary">{task.title}</p>
                  <p className="mt-1 text-xs text-theme-muted">
                    {task.description ?? "No description"}
                  </p>
                </td>
                <td className="w-[190px] px-3 py-3">
                  <Select
                    value={task.status}
                    disabled={isUpdatingTask}
                    onChange={(event) => {
                      void onUpdateStatus(task.id, event.target.value as TaskStatus);
                    }}
                    className="h-9 bg-[var(--input-bg)]"
                  >
                    {taskStatuses.map((statusValue) => (
                      <option key={statusValue} value={statusValue}>
                        {prettyStatus(statusValue)}
                      </option>
                    ))}
                  </Select>
                </td>
                <td className="px-3 py-3">
                  <Badge
                    variant={
                      task.priority === "high"
                        ? "danger"
                        : task.priority === "medium"
                          ? "sunrise"
                          : "neutral"
                    }
                  >
                    {task.priority}
                  </Badge>
                </td>
                <td className="px-3 py-3 text-theme-primary">
                  {task.assigneeName ?? "Unassigned"}
                </td>
                <td className="px-3 py-3 text-theme-primary">{task.dueDate ?? "-"}</td>
                <td className="px-3 py-3">
                  <div className="space-y-1">
                    <Badge variant={statusVariant(task.status)}>{prettyStatus(task.status)}</Badge>
                    <p className="text-xs text-theme-muted">
                      {new Date(task.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </td>
                <td className="px-3 py-3">
                  {onOpenTask ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenTask(task.id)}
                    >
                      Open
                    </Button>
                  ) : (
                    <span className="text-xs text-theme-muted">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
