import { sql } from "drizzle-orm";

import { db } from "./pool.js";
import { members, tasks, teams } from "./schema.js";

export async function runMigrations(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS teams (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS members (
      id SERIAL PRIMARY KEY,
      team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(team_id, email)
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'todo',
      priority TEXT NOT NULL DEFAULT 'medium',
      due_date DATE,
      assignee_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
      created_by_member_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    ALTER TABLE tasks
    DROP CONSTRAINT IF EXISTS tasks_status_check;
  `);

  await db.execute(sql`
    ALTER TABLE tasks
    ADD CONSTRAINT tasks_status_check CHECK (status IN ('todo', 'in_progress', 'blocked', 'done'));
  `);

  await db.execute(sql`
    ALTER TABLE tasks
    DROP CONSTRAINT IF EXISTS tasks_priority_check;
  `);

  await db.execute(sql`
    ALTER TABLE tasks
    ADD CONSTRAINT tasks_priority_check CHECK (priority IN ('low', 'medium', 'high'));
  `);

  await seedDefaults();
}

async function seedDefaults(): Promise<void> {
  const [existingTeam] = await db.select({ id: teams.id }).from(teams).limit(1);

  if (existingTeam) {
    return;
  }

  const [createdTeam] = await db
    .insert(teams)
    .values({
      name: "Platform Guild",
      description: "Default workspace for learning collaboration flows"
    })
    .returning({ id: teams.id });

  if (!createdTeam) {
    throw new Error("Failed to seed default team");
  }

  const insertedMembers = await db
    .insert(members)
    .values([
      {
        teamId: createdTeam.id,
        fullName: "Ali Mentor",
        email: "mentor@example.com",
        role: "lead"
      },
      {
        teamId: createdTeam.id,
        fullName: "Nara Builder",
        email: "nara@example.com",
        role: "member"
      }
    ])
    .returning({ id: members.id });

  const creatorId = insertedMembers[0]?.id ?? null;

  await db.insert(tasks).values({
    teamId: createdTeam.id,
    title: "Set weekly sprint goals",
    description: "Define what the team should deliver this week",
    status: "todo",
    priority: "high",
    assigneeId: creatorId,
    createdByMemberId: creatorId
  });
}
