import { apiRequest } from "../../../shared/api/http-client";
import type { Task, TaskFilters, TaskPriority, TaskStatus } from "../../../shared/types/api";

function toSearchParams(filters: TaskFilters): string {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.priority) {
    params.set("priority", filters.priority);
  }

  if (typeof filters.assigneeId === "number") {
    params.set("assigneeId", String(filters.assigneeId));
  }

  if (filters.search) {
    params.set("search", filters.search);
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export function getTasks(teamId: number, filters: TaskFilters): Promise<Task[]> {
  return apiRequest<Task[]>(`/api/teams/${teamId}/tasks${toSearchParams(filters)}`);
}

export function createTask(
  teamId: number,
  input: {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    assigneeId?: number | null;
    createdByMemberId?: number | null;
  }
): Promise<Task> {
  return apiRequest<Task>(`/api/teams/${teamId}/tasks`, {
    method: "POST",
    body: input
  });
}

export function updateTask(
  teamId: number,
  taskId: number,
  input: Partial<{
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string | null;
    assigneeId: number | null;
  }>
): Promise<Task> {
  return apiRequest<Task>(`/api/teams/${teamId}/tasks/${taskId}`, {
    method: "PATCH",
    body: input
  });
}
