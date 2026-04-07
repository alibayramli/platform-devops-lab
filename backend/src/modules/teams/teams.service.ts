import { HttpError } from "../../shared/http-error.js";
import {
  createTeam,
  deleteTeamById,
  getTeamSummary,
  listTeams,
  teamExists,
  updateTeamById
} from "./teams.repository.js";
import type { CreateTeamInput, TeamListItem, TeamSummary, UpdateTeamInput } from "./teams.types.js";

export async function getTeams(): Promise<TeamListItem[]> {
  return listTeams();
}

export async function createNewTeam(input: CreateTeamInput): Promise<TeamListItem> {
  return createTeam(input);
}

export async function updateExistingTeam(
  teamId: number,
  input: UpdateTeamInput
): Promise<TeamListItem> {
  const updatedTeam = await updateTeamById(teamId, input);

  if (!updatedTeam) {
    throw new HttpError(404, "Team not found");
  }

  return updatedTeam;
}

export async function deleteExistingTeam(teamId: number): Promise<void> {
  const wasDeleted = await deleteTeamById(teamId);

  if (!wasDeleted) {
    throw new HttpError(404, "Team not found");
  }
}

export async function getSummaryByTeamId(teamId: number): Promise<TeamSummary> {
  const summary = await getTeamSummary(teamId);

  if (!summary) {
    throw new HttpError(404, "Team not found");
  }

  return summary;
}

export async function assertTeamExists(teamId: number): Promise<void> {
  const exists = await teamExists(teamId);

  if (!exists) {
    throw new HttpError(404, "Team not found");
  }
}
