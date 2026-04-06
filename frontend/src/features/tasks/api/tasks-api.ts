import { apiRequest } from "../../../shared/api/http-client";
import type { Task, TaskFilters } from "../../../shared/types/api";
import type { CreateTaskInput, UpdateTaskInput } from "../types";

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

export function createTask(teamId: number, input: CreateTaskInput): Promise<Task> {
  return apiRequest<Task>(`/api/teams/${teamId}/tasks`, {
    method: "POST",
    body: input
  });
}

export function updateTask(teamId: number, taskId: number, input: UpdateTaskInput): Promise<Task> {
  return apiRequest<Task>(`/api/teams/${teamId}/tasks/${taskId}`, {
    method: "PATCH",
    body: input
  });
}

export function deleteTask(teamId: number, taskId: number): Promise<void> {
  return apiRequest<void>(`/api/teams/${teamId}/tasks/${taskId}`, {
    method: "DELETE"
  });
}
