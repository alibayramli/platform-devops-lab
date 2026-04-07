import { Router } from "express";

import { asyncHandler } from "../../shared/async-handler.js";
import { parseTeamIdParam } from "../../shared/request-parsers.js";
import {
  createNewTeam,
  deleteExistingTeam,
  getSummaryByTeamId,
  getTeams,
  updateExistingTeam
} from "./teams.service.js";
import { createTeamSchema, updateTeamSchema } from "./teams.types.js";

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

teamsRouter.patch(
  "/teams/:teamId",
  asyncHandler(async (req, res) => {
    const teamId = parseTeamIdParam(req.params);
    const input = updateTeamSchema.parse(req.body);
    const team = await updateExistingTeam(teamId, input);
    res.json(team);
  })
);

teamsRouter.delete(
  "/teams/:teamId",
  asyncHandler(async (req, res) => {
    const teamId = parseTeamIdParam(req.params);
    await deleteExistingTeam(teamId);
    res.status(204).send();
  })
);

teamsRouter.get(
  "/teams/:teamId/summary",
  asyncHandler(async (req, res) => {
    const teamId = parseTeamIdParam(req.params);
    const summary = await getSummaryByTeamId(teamId);
    res.json(summary);
  })
);
