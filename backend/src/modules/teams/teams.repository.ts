import { asc, eq, sql } from "drizzle-orm";

import { db } from "../../db/pool.js";
import { members, tasks, teams } from "../../db/schema.js";
import type { CreateTeamInput, TeamListItem, TeamSummary, UpdateTeamInput } from "./teams.types.js";

const teamListItemSelection = {
  id: teams.id,
  name: teams.name,
  description: teams.description,
  createdAt: teams.createdAt,
  memberCount: sql<number>`count(distinct ${members.id})`.mapWith(Number),
  taskCount: sql<number>`count(distinct ${tasks.id})`.mapWith(Number)
};

const teamSummarySelection = {
  totalTasks: sql<number>`count(distinct ${tasks.id})`.mapWith(Number),
  todo: sql<number>`count(distinct ${tasks.id}) filter (where ${tasks.status} = 'todo')`.mapWith(
    Number
  ),
  inProgress:
    sql<number>`count(distinct ${tasks.id}) filter (where ${tasks.status} = 'in_progress')`.mapWith(
      Number
    ),
  blocked:
    sql<number>`count(distinct ${tasks.id}) filter (where ${tasks.status} = 'blocked')`.mapWith(
      Number
    ),
  done: sql<number>`count(distinct ${tasks.id}) filter (where ${tasks.status} = 'done')`.mapWith(
    Number
  ),
  memberCount: sql<number>`count(distinct ${members.id})`.mapWith(Number)
};

async function getTeamListItemById(teamId: number): Promise<TeamListItem | null> {
  const [row] = await db
    .select(teamListItemSelection)
    .from(teams)
    .leftJoin(members, eq(members.teamId, teams.id))
    .leftJoin(tasks, eq(tasks.teamId, teams.id))
    .where(eq(teams.id, teamId))
    .groupBy(teams.id, teams.name, teams.description, teams.createdAt);

  return row ?? null;
}

export async function listTeams(): Promise<TeamListItem[]> {
  return db
    .select(teamListItemSelection)
    .from(teams)
    .leftJoin(members, eq(members.teamId, teams.id))
    .leftJoin(tasks, eq(tasks.teamId, teams.id))
    .groupBy(teams.id, teams.name, teams.description, teams.createdAt)
    .orderBy(asc(teams.createdAt));
}

export async function createTeam(input: CreateTeamInput): Promise<TeamListItem> {
  const [row] = await db
    .insert(teams)
    .values({
      name: input.name,
      description: input.description ?? null
    })
    .returning({
      id: teams.id,
      name: teams.name,
      description: teams.description,
      createdAt: teams.createdAt
    });

  return {
    ...row,
    memberCount: 0,
    taskCount: 0
  };
}

export async function updateTeamById(
  teamId: number,
  input: UpdateTeamInput
): Promise<TeamListItem | null> {
  const updatePayload: Partial<{
    name: string;
    description: string | null;
  }> = {};

  if (typeof input.name === "string") {
    updatePayload.name = input.name;
  }

  if (input.description !== undefined) {
    updatePayload.description = input.description ?? null;
  }

  await db.update(teams).set(updatePayload).where(eq(teams.id, teamId));
  return getTeamListItemById(teamId);
}

export async function deleteTeamById(teamId: number): Promise<boolean> {
  const [deleted] = await db.delete(teams).where(eq(teams.id, teamId)).returning({ id: teams.id });
  return Boolean(deleted);
}

export async function teamExists(teamId: number): Promise<boolean> {
  const rows = await db.select({ id: teams.id }).from(teams).where(eq(teams.id, teamId)).limit(1);
  return rows.length > 0;
}

export async function getTeamSummary(teamId: number): Promise<TeamSummary | null> {
  const [row] = await db
    .select(teamSummarySelection)
    .from(teams)
    .leftJoin(members, eq(members.teamId, teams.id))
    .leftJoin(tasks, eq(tasks.teamId, teams.id))
    .where(eq(teams.id, teamId))
    .groupBy(teams.id);

  return row ?? null;
}
