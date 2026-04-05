import { asc, and, eq } from "drizzle-orm";

import { db } from "../../db/pool.js";
import { members } from "../../db/schema.js";
import type { CreateMemberInput, Member, UpdateMemberInput } from "./members.types.js";

export async function listMembersByTeamId(teamId: number): Promise<Member[]> {
  return db
    .select({
      id: members.id,
      teamId: members.teamId,
      fullName: members.fullName,
      email: members.email,
      role: members.role,
      createdAt: members.createdAt
    })
    .from(members)
    .where(eq(members.teamId, teamId))
    .orderBy(asc(members.createdAt));
}

export async function createMemberForTeam(
  teamId: number,
  input: CreateMemberInput
): Promise<Member> {
  const [row] = await db
    .insert(members)
    .values({
      teamId,
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      role: input.role
    })
    .returning({
      id: members.id,
      teamId: members.teamId,
      fullName: members.fullName,
      email: members.email,
      role: members.role,
      createdAt: members.createdAt
    });

  if (!row) {
    throw new Error("Failed to create member");
  }

  return row;
}

export async function updateMemberById(
  memberId: number,
  teamId: number,
  input: UpdateMemberInput
): Promise<Member> {
  const updatePayload: Partial<{
    fullName: string;
    email: string;
    role: Member["role"];
  }> = {};

  if (typeof input.fullName === "string") {
    updatePayload.fullName = input.fullName;
  }

  if (typeof input.email === "string") {
    updatePayload.email = input.email.toLowerCase();
  }

  if (input.role) {
    updatePayload.role = input.role;
  }

  const [row] = await db
    .update(members)
    .set(updatePayload)
    .where(and(eq(members.id, memberId), eq(members.teamId, teamId)))
    .returning({
      id: members.id,
      teamId: members.teamId,
      fullName: members.fullName,
      email: members.email,
      role: members.role,
      createdAt: members.createdAt
    });

  if (!row) {
    throw new Error("Failed to update member");
  }

  return row;
}

export async function deleteMemberById(memberId: number, teamId: number): Promise<void> {
  await db.delete(members).where(and(eq(members.id, memberId), eq(members.teamId, teamId)));
}

export async function memberBelongsToTeam(memberId: number, teamId: number): Promise<boolean> {
  const rows = await db
    .select({ id: members.id })
    .from(members)
    .where(and(eq(members.id, memberId), eq(members.teamId, teamId)))
    .limit(1);

  return rows.length > 0;
}
