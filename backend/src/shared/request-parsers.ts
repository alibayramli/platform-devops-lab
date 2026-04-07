import { HttpError } from "./http-error.js";

export function parseId(value: string, fieldName: string): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new HttpError(400, `${fieldName} must be a positive integer`);
  }

  return parsed;
}

type TeamRouteParams = {
  teamId?: string;
};

type TeamMemberRouteParams = TeamRouteParams & {
  memberId?: string;
};

type TeamTaskRouteParams = TeamRouteParams & {
  taskId?: string;
};

export function parseTeamIdParam(params: TeamRouteParams): number {
  return parseId(params.teamId ?? "", "teamId");
}

export function parseTeamMemberParams(params: TeamMemberRouteParams) {
  return {
    memberId: parseId(params.memberId ?? "", "memberId"),
    teamId: parseTeamIdParam(params)
  };
}

export function parseTeamTaskParams(params: TeamTaskRouteParams) {
  return {
    taskId: parseId(params.taskId ?? "", "taskId"),
    teamId: parseTeamIdParam(params)
  };
}
