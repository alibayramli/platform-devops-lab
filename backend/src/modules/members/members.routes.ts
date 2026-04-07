import { Router } from "express";

import { asyncHandler } from "../../shared/async-handler.js";
import { parseTeamIdParam, parseTeamMemberParams } from "../../shared/request-parsers.js";
import { createMember, deleteMember, getMembersByTeamId, updateMember } from "./members.service.js";
import { createMemberSchema, updateMemberSchema } from "./members.types.js";

export const membersRouter = Router();

membersRouter.get(
  "/teams/:teamId/members",
  asyncHandler(async (req, res) => {
    const teamId = parseTeamIdParam(req.params);
    const members = await getMembersByTeamId(teamId);
    res.json(members);
  })
);

membersRouter.post(
  "/teams/:teamId/members",
  asyncHandler(async (req, res) => {
    const teamId = parseTeamIdParam(req.params);
    const input = createMemberSchema.parse(req.body);
    const member = await createMember(teamId, input);
    res.status(201).json(member);
  })
);

membersRouter.patch(
  "/teams/:teamId/members/:memberId",
  asyncHandler(async (req, res) => {
    const { memberId, teamId } = parseTeamMemberParams(req.params);
    const input = updateMemberSchema.parse(req.body);
    const member = await updateMember(teamId, memberId, input);
    res.json(member);
  })
);

membersRouter.delete(
  "/teams/:teamId/members/:memberId",
  asyncHandler(async (req, res) => {
    const { memberId, teamId } = parseTeamMemberParams(req.params);
    await deleteMember(teamId, memberId);
    res.status(204).send();
  })
);
