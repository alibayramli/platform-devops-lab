import { Router } from "express";

import { asyncHandler } from "../../shared/async-handler.js";
import { parseId } from "../../shared/request-parsers.js";
import { createMember, getMembersByTeamId } from "./members.service.js";
import { createMemberSchema } from "./members.types.js";

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
