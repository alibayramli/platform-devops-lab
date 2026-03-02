import { z } from "zod";

export const createMemberSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  role: z.enum(["lead", "member", "observer"]).default("member")
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;

export type Member = {
  id: number;
  teamId: number;
  fullName: string;
  email: string;
  role: "lead" | "member" | "observer";
  createdAt: string;
};
