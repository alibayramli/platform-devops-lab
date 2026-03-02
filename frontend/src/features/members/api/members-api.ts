import { apiRequest } from "../../../shared/api/http-client";
import type { Member, MemberRole } from "../../../shared/types/api";

export function getMembers(teamId: number): Promise<Member[]> {
  return apiRequest<Member[]>(`/api/teams/${teamId}/members`);
}

export function createMember(
  teamId: number,
  input: { fullName: string; email: string; role: MemberRole }
): Promise<Member> {
  return apiRequest<Member>(`/api/teams/${teamId}/members`, {
    method: "POST",
    body: input
  });
}
