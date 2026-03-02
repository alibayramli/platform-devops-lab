import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createTeam, getTeamSummary, getTeams } from "../api/teams-api";

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

export function useTeamSummary(teamId: number | null) {
  return useQuery({
    queryKey: ["teams", teamId, "summary"],
    queryFn: () => getTeamSummary(teamId ?? 0),
    enabled: typeof teamId === "number"
  });
}
