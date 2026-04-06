import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { invalidateTeamWorkspaceQueries, queryKeys } from "../../../shared/api/query-keys";
import type { MemberRole } from "../../../shared/types/api";
import { createMember, deleteMember, getMembers, updateMember } from "../api/members-api";

export function useMembers(teamId: number | null) {
  return useQuery({
    queryKey: queryKeys.teams.members(teamId),
    queryFn: () => getMembers(teamId ?? 0),
    enabled: typeof teamId === "number"
  });
}

export function useCreateMember(teamId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { fullName: string; email: string; role: MemberRole }) =>
      createMember(teamId ?? 0, input),
    onSuccess: async () => {
      await invalidateTeamWorkspaceQueries(queryClient, teamId, {
        includeTeams: true,
        includeMembers: true,
        includeSummary: true
      });
    }
  });
}

export function useUpdateMember(teamId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      memberId: number;
      patch: Partial<{
        fullName: string;
        email: string;
        role: MemberRole;
      }>;
    }) => updateMember(teamId ?? 0, input.memberId, input.patch),
    onSuccess: async () => {
      await invalidateTeamWorkspaceQueries(queryClient, teamId, {
        includeTeams: true,
        includeMembers: true,
        includeTasks: true,
        includeSummary: true
      });
    }
  });
}

export function useDeleteMember(teamId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: number) => deleteMember(teamId ?? 0, memberId),
    onSuccess: async () => {
      await invalidateTeamWorkspaceQueries(queryClient, teamId, {
        includeTeams: true,
        includeMembers: true,
        includeTasks: true,
        includeSummary: true
      });
    }
  });
}
