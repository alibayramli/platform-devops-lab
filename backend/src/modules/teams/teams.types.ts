import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(240).optional()
});

export const updateTeamSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    description: z.string().trim().max(240).nullable().optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
  });

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;

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
