import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { invalidateTeamWorkspaceQueries, queryKeys } from "../../../shared/api/query-keys";
import { createTask, deleteTask, getTasks, updateTask } from "../api/tasks-api";
import type { TaskFilters } from "../../../shared/types/api";
import type { CreateTaskInput, UpdateTaskInput } from "../types";

export function useTasks(teamId: number | null, filters: TaskFilters) {
  return useQuery({
    queryKey: queryKeys.teams.tasks(teamId, filters),
    queryFn: () => getTasks(teamId ?? 0, filters),
    enabled: typeof teamId === "number"
  });
}

export function useCreateTask(teamId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(teamId ?? 0, input),
    onSuccess: async () => {
      await invalidateTeamWorkspaceQueries(queryClient, teamId, {
        includeTeams: true,
        includeTasks: true,
        includeSummary: true
      });
    }
  });
}

export function useUpdateTask(teamId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { taskId: number; patch: UpdateTaskInput }) =>
      updateTask(teamId ?? 0, input.taskId, input.patch),
    onSuccess: async () => {
      await invalidateTeamWorkspaceQueries(queryClient, teamId, {
        includeTeams: true,
        includeTasks: true,
        includeSummary: true
      });
    }
  });
}

export function useDeleteTask(teamId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: number) => deleteTask(teamId ?? 0, taskId),
    onSuccess: async () => {
      await invalidateTeamWorkspaceQueries(queryClient, teamId, {
        includeTeams: true,
        includeTasks: true,
        includeSummary: true
      });
    }
  });
}
