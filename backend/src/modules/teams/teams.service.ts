import { HttpError } from "../../shared/http-error.js";
import { createTeam, getTeamSummary, listTeams, teamExists } from "./teams.repository.js";
import type { CreateTeamInput, TeamListItem, TeamSummary } from "./teams.types.js";

export async function getTeams(): Promise<TeamListItem[]> {
  return listTeams();
}

export async function createNewTeam(input: CreateTeamInput): Promise<TeamListItem> {
  return createTeam(input);
}

export async function getSummaryByTeamId(teamId: number): Promise<TeamSummary> {
  const exists = await teamExists(teamId);

  if (!exists) {
    throw new HttpError(404, "Team not found");
  }

  return getTeamSummary(teamId);
}

export async function assertTeamExists(teamId: number): Promise<void> {
  const exists = await teamExists(teamId);

  if (!exists) {
    throw new HttpError(404, "Team not found");
  }
}
