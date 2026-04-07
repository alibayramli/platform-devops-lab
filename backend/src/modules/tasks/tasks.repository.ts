import { and, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";

import { db } from "../../db/pool.js";
import { members, tasks } from "../../db/schema.js";
import type { CreateTaskInput, Task, TaskFilters, UpdateTaskInput } from "./tasks.types.js";

const assigneeNameSelection = sql<string | null>`(
  select ${members.fullName}
  from ${members}
  where ${members.id} = ${tasks.assigneeId}
  limit 1
)`;

const taskSelection = {
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
};

const returningTaskSelection = {
  id: tasks.id,
  teamId: tasks.teamId,
  title: tasks.title,
  description: tasks.description,
  status: tasks.status,
  priority: tasks.priority,
  dueDate: tasks.dueDate,
  assigneeId: tasks.assigneeId,
  assigneeName: assigneeNameSelection,
  createdByMemberId: tasks.createdByMemberId,
  createdAt: tasks.createdAt,
  updatedAt: tasks.updatedAt
};

function buildTaskUpdatePayload(input: UpdateTaskInput): Partial<{
  title: string;
  description: string | null;
  status: Task["status"];
  priority: Task["priority"];
  dueDate: string | null;
  assigneeId: number | null;
}> {
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

  return updatePayload;
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
    .select(taskSelection)
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
    .returning(returningTaskSelection);

  if (!created) {
    throw new Error("Failed to create task");
  }

  return created;
}

export async function updateTaskById(
  taskId: number,
  teamId: number,
  input: UpdateTaskInput
): Promise<Task | null> {
  const updatePayload = buildTaskUpdatePayload(input);
  const [updated] = await db
    .update(tasks)
    .set({
      ...updatePayload,
      updatedAt: sql`NOW()`
    })
    .where(and(eq(tasks.id, taskId), eq(tasks.teamId, teamId)))
    .returning(returningTaskSelection);

  return updated ?? null;
}

export async function deleteTaskById(taskId: number, teamId: number): Promise<boolean> {
  const [deleted] = await db
    .delete(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.teamId, teamId)))
    .returning({ id: tasks.id });

  return Boolean(deleted);
}
