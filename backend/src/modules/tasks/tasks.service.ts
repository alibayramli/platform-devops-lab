import { HttpError } from "../../shared/http-error.js";
import { assertMemberInTeam } from "../members/members.service.js";
import { assertTeamExists } from "../teams/teams.service.js";
import {
  createTaskForTeam,
  listTasksByTeamId,
  taskExists,
  updateTaskById
} from "./tasks.repository.js";
import type { CreateTaskInput, Task, TaskFilters, UpdateTaskInput } from "./tasks.types.js";

async function assertTaskExists(teamId: number, taskId: number): Promise<void> {
  const exists = await taskExists(taskId, teamId);

  if (!exists) {
    throw new HttpError(404, "Task not found");
  }
}

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
  await assertTeamExists(teamId);
  await assertTaskExists(teamId, taskId);

  if (typeof input.assigneeId === "number") {
    await assertMemberInTeam(teamId, input.assigneeId);
  }

  return updateTaskById(taskId, teamId, input);
}
