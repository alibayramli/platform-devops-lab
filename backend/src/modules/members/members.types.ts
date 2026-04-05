import { z } from "zod";

export const createMemberSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  role: z.enum(["lead", "member", "observer"]).default("member")
});

export const updateMemberSchema = z
  .object({
    fullName: z.string().trim().min(2).max(80).optional(),
    email: z.string().trim().email().max(120).optional(),
    role: z.enum(["lead", "member", "observer"]).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
  });

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;

export type Member = {
  id: number;
  teamId: number;
  fullName: string;
  email: string;
  role: "lead" | "member" | "observer";
  createdAt: string;
};
