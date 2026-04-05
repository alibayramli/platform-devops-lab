import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createTeam, deleteTeam, getTeamSummary, getTeams, updateTeam } from "../api/teams-api";

export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: getTeams
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeam,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
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
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
      await queryClient.invalidateQueries({ queryKey: ["teams", variables.teamId, "summary"] });
    }
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: number) => deleteTeam(teamId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
    }
  });
}

export function useTeamSummary(teamId: number | null) {
  return useQuery({
    queryKey: ["teams", teamId, "summary"],
    queryFn: () => getTeamSummary(teamId ?? 0),
    enabled: typeof teamId === "number"
  });
}
