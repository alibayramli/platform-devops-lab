import { and, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";

import { db } from "../../db/pool.js";
import { members, tasks } from "../../db/schema.js";
import type { CreateTaskInput, Task, TaskFilters, UpdateTaskInput } from "./tasks.types.js";

async function resolveAssigneeName(assigneeId: number | null): Promise<string | null> {
  if (typeof assigneeId !== "number") {
    return null;
  }

  const [assignee] = await db
    .select({ fullName: members.fullName })
    .from(members)
    .where(eq(members.id, assigneeId))
    .limit(1);

  return assignee?.fullName ?? null;
}

export async function listTasksByTeamId(teamId: number, filters: TaskFilters): Promise<Task[]> {
  const conditions: SQL[] = [eq(tasks.teamId, teamId)];

  if (filters.status) {
    conditions.push(eq(tasks.status, filters.status));
  }

  if (filters.priority) {
    conditions.push(eq(tasks.priority, filters.priority));
  }

  if (typeof filters.assigneeId === "number") {
    conditions.push(eq(tasks.assigneeId, filters.assigneeId));
  }

  if (filters.search) {
    const searchPattern = `%${filters.search}%`;
    conditions.push(
      or(ilike(tasks.title, searchPattern), ilike(tasks.description, searchPattern))!
    );
  }

  const priorityOrder = sql<number>`
    CASE ${tasks.priority}
      WHEN 'high' THEN 1
      WHEN 'medium' THEN 2
      ELSE 3
    END
  `;

  return db
    .select({
      id: tasks.id,
      teamId: tasks.teamId,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      assigneeId: tasks.assigneeId,
      assigneeName: members.fullName,
      createdByMemberId: tasks.createdByMemberId,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt
    })
    .from(tasks)
    .leftJoin(members, eq(members.id, tasks.assigneeId))
    .where(and(...conditions))
    .orderBy(priorityOrder, desc(tasks.createdAt));
}

export async function createTaskForTeam(teamId: number, input: CreateTaskInput): Promise<Task> {
  const [created] = await db
    .insert(tasks)
    .values({
      teamId,
      title: input.title,
      description: input.description ?? null,
      status: input.status,
      priority: input.priority,
      dueDate: input.dueDate ?? null,
      assigneeId: input.assigneeId ?? null,
      createdByMemberId: input.createdByMemberId ?? null
    })
    .returning({
      id: tasks.id,
      teamId: tasks.teamId,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      assigneeId: tasks.assigneeId,
      createdByMemberId: tasks.createdByMemberId,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt
    });

  if (!created) {
    throw new Error("Failed to create task");
  }

  return {
    ...created,
    assigneeName: await resolveAssigneeName(created.assigneeId)
  };
}

export async function taskExists(taskId: number, teamId: number): Promise<boolean> {
  const rows = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.teamId, teamId)))
    .limit(1);

  return rows.length > 0;
}

export async function updateTaskById(
  taskId: number,
  teamId: number,
  input: UpdateTaskInput
): Promise<Task> {
  const updatePayload: Partial<{
    title: string;
    description: string | null;
    status: Task["status"];
    priority: Task["priority"];
    dueDate: string | null;
    assigneeId: number | null;
  }> = {};

  if (typeof input.title === "string") {
    updatePayload.title = input.title;
  }

  if (input.description !== undefined) {
    updatePayload.description = input.description ?? null;
  }

  if (input.status) {
    updatePayload.status = input.status;
  }

  if (input.priority) {
    updatePayload.priority = input.priority;
  }

  if (input.dueDate !== undefined) {
    updatePayload.dueDate = input.dueDate ?? null;
  }

  if (input.assigneeId !== undefined) {
    updatePayload.assigneeId = input.assigneeId ?? null;
  }

  const [updated] = await db
    .update(tasks)
    .set({
      ...updatePayload,
      updatedAt: sql`NOW()`
    })
    .where(and(eq(tasks.id, taskId), eq(tasks.teamId, teamId)))
    .returning({
      id: tasks.id,
      teamId: tasks.teamId,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      assigneeId: tasks.assigneeId,
      createdByMemberId: tasks.createdByMemberId,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt
    });

  if (!updated) {
    throw new Error("Failed to update task");
  }

  return {
    ...updated,
    assigneeName: await resolveAssigneeName(updated.assigneeId)
  };
}

export async function deleteTaskById(taskId: number, teamId: number): Promise<void> {
  await db.delete(tasks).where(and(eq(tasks.id, taskId), eq(tasks.teamId, teamId)));
}
