import type { Task, TaskPriority, TaskStatus } from "../../shared/types/api";

export type TaskFormValues = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assigneeId: number | "";
};

export type CreateTaskInput = {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assigneeId?: number | null;
  createdByMemberId?: number | null;
};

export type UpdateTaskInput = Partial<{
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assigneeId: number | null;
}>;

export function createTaskFormValues(task?: Task | null): TaskFormValues {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: task?.status ?? "todo",
    priority: task?.priority ?? "medium",
    dueDate: task?.dueDate ?? "",
    assigneeId: task?.assigneeId ?? ""
  };
}
