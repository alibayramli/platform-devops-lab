import type { Task } from "../../shared/types/api";
import { formatEnumLabel } from "../../shared/lib/format";
import type { CreateTaskInput, TaskFormValues, UpdateTaskInput } from "./types";

export function formatTaskStatusLabel(status: string): string {
  return formatEnumLabel(status, { capitalize: false });
}

export function formatTaskPriorityLabel(priority: string): string {
  return formatEnumLabel(priority);
}

export function buildCreateTaskInput(
  values: TaskFormValues,
  createdByMemberId: number | null
): CreateTaskInput | null {
  const title = values.title.trim();

  if (!title) {
    return null;
  }

  return {
    title,
    description: values.description.trim() || undefined,
    status: values.status,
    priority: values.priority,
    dueDate: values.dueDate || undefined,
    assigneeId: typeof values.assigneeId === "number" ? values.assigneeId : null,
    createdByMemberId
  };
}

export function buildUpdateTaskInput(values: TaskFormValues): UpdateTaskInput | null {
  const title = values.title.trim();

  if (!title) {
    return null;
  }

  return {
    title,
    description: values.description.trim() || null,
    status: values.status,
    priority: values.priority,
    dueDate: values.dueDate || null,
    assigneeId: typeof values.assigneeId === "number" ? values.assigneeId : null
  };
}

export function resolveTaskPriorityVariant(
  priority: Task["priority"]
): "danger" | "sunrise" | "deep" {
  switch (priority) {
    case "high":
      return "danger";
    case "medium":
      return "sunrise";
    case "low":
      return "deep";
  }
}

export function resolveTaskStatusVariant(
  status: Task["status"]
): "deep" | "sunrise" | "danger" | "mint" {
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
