import type { QueryClient } from "@tanstack/react-query";

import type { TaskFilters } from "../types/api";

export const queryKeys = {
  teams: {
    all: () => ["teams"] as const,
    summary: (teamId: number | null) => ["teams", teamId, "summary"] as const,
    members: (teamId: number | null) => ["teams", teamId, "members"] as const,
    tasks: (teamId: number | null, filters?: TaskFilters) =>
      filters === undefined
        ? (["teams", teamId, "tasks"] as const)
        : (["teams", teamId, "tasks", filters] as const)
  }
};

type TeamWorkspaceInvalidationOptions = {
  includeTeams?: boolean;
  includeMembers?: boolean;
  includeTasks?: boolean;
  includeSummary?: boolean;
};

export async function invalidateTeamWorkspaceQueries(
  queryClient: QueryClient,
  teamId: number | null,
  options: TeamWorkspaceInvalidationOptions
): Promise<void> {
  const invalidations: Promise<unknown>[] = [];

  if (options.includeTeams) {
    invalidations.push(queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() }));
  }

  if (typeof teamId === "number") {
    if (options.includeMembers) {
      invalidations.push(
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.members(teamId) })
      );
    }

    if (options.includeTasks) {
      invalidations.push(
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.tasks(teamId) })
      );
    }

    if (options.includeSummary) {
      invalidations.push(
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.summary(teamId) })
      );
    }
  }

  await Promise.all(invalidations);
}
