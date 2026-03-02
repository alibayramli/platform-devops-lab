import { asc, eq, sql } from "drizzle-orm";

import { db } from "../../db/pool.js";
import { members, tasks, teams } from "../../db/schema.js";
import type { CreateTeamInput, TeamListItem, TeamSummary } from "./teams.types.js";

export async function listTeams(): Promise<TeamListItem[]> {
  return db
    .select({
      id: teams.id,
      name: teams.name,
      description: teams.description,
      createdAt: teams.createdAt,
      memberCount: sql<number>`count(distinct ${members.id})`.mapWith(Number),
      taskCount: sql<number>`count(distinct ${tasks.id})`.mapWith(Number)
    })
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

export async function teamExists(teamId: number): Promise<boolean> {
  const rows = await db.select({ id: teams.id }).from(teams).where(eq(teams.id, teamId)).limit(1);
  return rows.length > 0;
}

export async function getTeamSummary(teamId: number): Promise<TeamSummary> {
  const [row] = await db
    .select({
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
    })
    .from(teams)
    .leftJoin(members, eq(members.teamId, teams.id))
    .leftJoin(tasks, eq(tasks.teamId, teams.id))
    .where(eq(teams.id, teamId))
    .groupBy(teams.id);

  return (
    row ?? {
      totalTasks: 0,
      todo: 0,
      inProgress: 0,
      blocked: 0,
      done: 0,
      memberCount: 0
    }
  );
}
