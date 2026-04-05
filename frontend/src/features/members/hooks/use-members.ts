import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createMember, deleteMember, getMembers, updateMember } from "../api/members-api";

export function useMembers(teamId: number | null) {
  return useQuery({
    queryKey: ["teams", teamId, "members"],
    queryFn: () => getMembers(teamId ?? 0),
    enabled: typeof teamId === "number"
  });
}

export function useCreateMember(teamId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      fullName: string;
      email: string;
      role: "lead" | "member" | "observer";
    }) => createMember(teamId ?? 0, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teams", teamId, "members"] });
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
      await queryClient.invalidateQueries({ queryKey: ["teams", teamId, "summary"] });
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
        role: "lead" | "member" | "observer";
      }>;
    }) => updateMember(teamId ?? 0, input.memberId, input.patch),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teams", teamId, "members"] });
      await queryClient.invalidateQueries({ queryKey: ["teams", teamId, "tasks"] });
      await queryClient.invalidateQueries({ queryKey: ["teams", teamId, "summary"] });
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
    }
  });
}

export function useDeleteMember(teamId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: number) => deleteMember(teamId ?? 0, memberId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teams", teamId, "members"] });
      await queryClient.invalidateQueries({ queryKey: ["teams", teamId, "tasks"] });
      await queryClient.invalidateQueries({ queryKey: ["teams", teamId, "summary"] });
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
    }
  });
}
