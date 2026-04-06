import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../../shared/api/query-keys";
import { createTeam, deleteTeam, getTeamSummary, getTeams, updateTeam } from "../api/teams-api";

export function useTeams() {
  return useQuery({
    queryKey: queryKeys.teams.all(),
    queryFn: getTeams
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeam,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() });
    }
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      teamId: number;
      patch: Partial<{ name: string; description: string | null }>;
    }) => updateTeam(input.teamId, input.patch),
    onSuccess: async (_team, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.teams.summary(variables.teamId)
      });
    }
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: number) => deleteTeam(teamId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() });
    }
  });
}

export function useTeamSummary(teamId: number | null) {
  return useQuery({
    queryKey: queryKeys.teams.summary(teamId),
    queryFn: () => getTeamSummary(teamId ?? 0),
    enabled: typeof teamId === "number"
  });
}
