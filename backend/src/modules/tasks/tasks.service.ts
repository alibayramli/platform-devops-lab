import { HttpError } from "../../shared/http-error.js";
import { assertMemberInTeam } from "../members/members.service.js";
import { assertTeamExists } from "../teams/teams.service.js";
import {
  createTaskForTeam,
  deleteTaskById,
  listTasksByTeamId,
  updateTaskById
} from "./tasks.repository.js";
import type { CreateTaskInput, Task, TaskFilters, UpdateTaskInput } from "./tasks.types.js";

export async function getTasksByTeamId(teamId: number, filters: TaskFilters): Promise<Task[]> {
  await assertTeamExists(teamId);
  return listTasksByTeamId(teamId, filters);
}

export async function createTask(teamId: number, input: CreateTaskInput): Promise<Task> {
  await assertTeamExists(teamId);

  if (typeof input.assigneeId === "number") {
    await assertMemberInTeam(teamId, input.assigneeId);
  }

  if (typeof input.createdByMemberId === "number") {
    await assertMemberInTeam(teamId, input.createdByMemberId);
  }

  return createTaskForTeam(teamId, input);
}

export async function updateTask(
  teamId: number,
  taskId: number,
  input: UpdateTaskInput
): Promise<Task> {
  if (typeof input.assigneeId === "number") {
    await assertTeamExists(teamId);
    await assertMemberInTeam(teamId, input.assigneeId);
  }

  const updatedTask = await updateTaskById(taskId, teamId, input);

  if (!updatedTask) {
    await assertTeamExists(teamId);
    throw new HttpError(404, "Task not found");
  }

  return updatedTask;
}

export async function deleteTask(teamId: number, taskId: number): Promise<void> {
  const wasDeleted = await deleteTaskById(taskId, teamId);

  if (!wasDeleted) {
    await assertTeamExists(teamId);
    throw new HttpError(404, "Task not found");
  }
}
