import { Router } from "express";

import { asyncHandler } from "../../shared/async-handler.js";
import { parseId } from "../../shared/request-parsers.js";
import { createNewTeam, getSummaryByTeamId, getTeams } from "./teams.service.js";
import { createTeamSchema } from "./teams.types.js";

export const teamsRouter = Router();

teamsRouter.get(
  "/teams",
  asyncHandler(async (_req, res) => {
    const teams = await getTeams();
    res.json(teams);
  })
);

teamsRouter.post(
  "/teams",
  asyncHandler(async (req, res) => {
    const input = createTeamSchema.parse(req.body);
    const team = await createNewTeam(input);
    res.status(201).json(team);
  })
);

teamsRouter.get(
  "/teams/:teamId/summary",
  asyncHandler(async (req, res) => {
    const teamId = parseId(req.params.teamId, "teamId");
    const summary = await getSummaryByTeamId(teamId);
    res.json(summary);
  })
);
