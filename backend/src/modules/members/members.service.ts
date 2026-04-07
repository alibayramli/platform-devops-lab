import { HttpError } from "../../shared/http-error.js";
import { isUniqueConstraintViolation } from "../../shared/postgres-errors.js";
import { assertTeamExists } from "../teams/teams.service.js";
import {
  createMemberForTeam,
  deleteMemberById,
  listMembersByTeamId,
  memberBelongsToTeam,
  updateMemberById
} from "./members.repository.js";
import type { CreateMemberInput, Member, UpdateMemberInput } from "./members.types.js";

export async function getMembersByTeamId(teamId: number): Promise<Member[]> {
  await assertTeamExists(teamId);
  return listMembersByTeamId(teamId);
}

export async function createMember(teamId: number, input: CreateMemberInput): Promise<Member> {
  await assertTeamExists(teamId);

  try {
    return await createMemberForTeam(teamId, input);
  } catch (error) {
    if (isUniqueConstraintViolation(error)) {
      throw new HttpError(409, "A member with this email already exists in the team");
    }

    throw error;
  }
}

export async function updateMember(
  teamId: number,
  memberId: number,
  input: UpdateMemberInput
): Promise<Member> {
  await assertTeamExists(teamId);
  await assertMemberInTeam(teamId, memberId);

  try {
    return await updateMemberById(memberId, teamId, input);
  } catch (error) {
    if (isUniqueConstraintViolation(error)) {
      throw new HttpError(409, "A member with this email already exists in the team");
    }

    throw error;
  }
}

export async function deleteMember(teamId: number, memberId: number): Promise<void> {
  await assertTeamExists(teamId);
  await assertMemberInTeam(teamId, memberId);
  await deleteMemberById(memberId, teamId);
}

export async function assertMemberInTeam(teamId: number, memberId: number): Promise<void> {
  const exists = await memberBelongsToTeam(memberId, teamId);

  if (!exists) {
    throw new HttpError(400, "Assignee must belong to the same team");
  }
}
