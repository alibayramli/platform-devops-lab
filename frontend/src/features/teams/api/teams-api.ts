import { apiRequest } from "../../../shared/api/http-client";
import type { TeamListItem, TeamSummary } from "../../../shared/types/api";

export function getTeams(): Promise<TeamListItem[]> {
  return apiRequest<TeamListItem[]>("/api/teams");
}

export function createTeam(input: { name: string; description?: string }): Promise<TeamListItem> {
  return apiRequest<TeamListItem>("/api/teams", {
    method: "POST",
    body: input
  });
}

export function getTeamSummary(teamId: number): Promise<TeamSummary> {
  return apiRequest<TeamSummary>(`/api/teams/${teamId}/summary`);
}
