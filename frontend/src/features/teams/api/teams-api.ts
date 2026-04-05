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

export function updateTeam(
  teamId: number,
  input: Partial<{ name: string; description: string | null }>
): Promise<TeamListItem> {
  return apiRequest<TeamListItem>(`/api/teams/${teamId}`, {
    method: "PATCH",
    body: input
  });
}

export function deleteTeam(teamId: number): Promise<void> {
  return apiRequest<void>(`/api/teams/${teamId}`, {
    method: "DELETE"
  });
}

export function getTeamSummary(teamId: number): Promise<TeamSummary> {
  return apiRequest<TeamSummary>(`/api/teams/${teamId}/summary`);
}
