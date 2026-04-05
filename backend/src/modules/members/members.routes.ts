import { Router } from "express";

import { asyncHandler } from "../../shared/async-handler.js";
import { parseId } from "../../shared/request-parsers.js";
import { createMember, deleteMember, getMembersByTeamId, updateMember } from "./members.service.js";
import { createMemberSchema, updateMemberSchema } from "./members.types.js";

export const membersRouter = Router();

membersRouter.get(
  "/teams/:teamId/members",
  asyncHandler(async (req, res) => {
    const teamId = parseId(req.params.teamId, "teamId");
    const members = await getMembersByTeamId(teamId);
    res.json(members);
  })
);

membersRouter.post(
  "/teams/:teamId/members",
  asyncHandler(async (req, res) => {
    const teamId = parseId(req.params.teamId, "teamId");
    const input = createMemberSchema.parse(req.body);
    const member = await createMember(teamId, input);
    res.status(201).json(member);
  })
);

membersRouter.patch(
  "/teams/:teamId/members/:memberId",
  asyncHandler(async (req, res) => {
    const teamId = parseId(req.params.teamId, "teamId");
    const memberId = parseId(req.params.memberId, "memberId");
    const input = updateMemberSchema.parse(req.body);
    const member = await updateMember(teamId, memberId, input);
    res.json(member);
  })
);

membersRouter.delete(
  "/teams/:teamId/members/:memberId",
  asyncHandler(async (req, res) => {
    const teamId = parseId(req.params.teamId, "teamId");
    const memberId = parseId(req.params.memberId, "memberId");
    await deleteMember(teamId, memberId);
    res.status(204).send();
  })
);
