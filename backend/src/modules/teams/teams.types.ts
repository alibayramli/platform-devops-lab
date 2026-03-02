import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(240).optional()
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

export type TeamListItem = {
  id: number;
  name: string;
  description: string | null;
  memberCount: number;
  taskCount: number;
  createdAt: string;
};

export type TeamSummary = {
  totalTasks: number;
  todo: number;
  inProgress: number;
  blocked: number;
  done: number;
  memberCount: number;
};
