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

export function updateMember(
  teamId: number,
  memberId: number,
  input: Partial<{ fullName: string; email: string; role: MemberRole }>
): Promise<Member> {
  return apiRequest<Member>(`/api/teams/${teamId}/members/${memberId}`, {
    method: "PATCH",
    body: input
  });
}

export function deleteMember(teamId: number, memberId: number): Promise<void> {
  return apiRequest<void>(`/api/teams/${teamId}/members/${memberId}`, {
    method: "DELETE"
  });
}
