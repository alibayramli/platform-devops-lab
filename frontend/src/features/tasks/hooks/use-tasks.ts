import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createTask, deleteTask, getTasks, updateTask } from "../api/tasks-api";
import type { TaskFilters } from "../../../shared/types/api";

export function useTasks(teamId: number | null, filters: TaskFilters) {
  return useQuery({
    queryKey: ["teams", teamId, "tasks", filters],
    queryFn: () => getTasks(teamId ?? 0, filters),
    enabled: typeof teamId === "number"
  });
}

export function useCreateTask(teamId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      title: string;
      description?: string;
      status: "todo" | "in_progress" | "blocked" | "done";
      priority: "low" | "medium" | "high";
      dueDate?: string;
      assigneeId?: number | null;
      createdByMemberId?: number | null;
    }) => createTask(teamId ?? 0, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teams", teamId, "tasks"] });
      await queryClient.invalidateQueries({ queryKey: ["teams", teamId, "summary"] });
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
    }
  });
}

export function useUpdateTask(teamId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      taskId: number;
      patch: Partial<{
        title: string;
        description: string | null;
        status: "todo" | "in_progress" | "blocked" | "done";
        priority: "low" | "medium" | "high";
        dueDate: string | null;
        assigneeId: number | null;
      }>;
    }) => updateTask(teamId ?? 0, input.taskId, input.patch),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teams", teamId, "tasks"] });
      await queryClient.invalidateQueries({ queryKey: ["teams", teamId, "summary"] });
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
    }
  });
}

export function useDeleteTask(teamId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: number) => deleteTask(teamId ?? 0, taskId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teams", teamId, "tasks"] });
      await queryClient.invalidateQueries({ queryKey: ["teams", teamId, "summary"] });
      await queryClient.invalidateQueries({ queryKey: ["teams"] });
    }
  });
}
