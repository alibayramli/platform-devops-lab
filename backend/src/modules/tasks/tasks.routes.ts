import { Router } from "express";

import { asyncHandler } from "../../shared/async-handler.js";
import { parseId } from "../../shared/request-parsers.js";
import { createTask, deleteTask, getTasksByTeamId, updateTask } from "./tasks.service.js";
import { createTaskSchema, taskFiltersSchema, updateTaskSchema } from "./tasks.types.js";

export const tasksRouter = Router();

tasksRouter.get(
  "/teams/:teamId/tasks",
  asyncHandler(async (req, res) => {
    const teamId = parseId(req.params.teamId, "teamId");
    const filters = taskFiltersSchema.parse(req.query);
    const tasks = await getTasksByTeamId(teamId, filters);
    res.json(tasks);
  })
);

tasksRouter.post(
  "/teams/:teamId/tasks",
  asyncHandler(async (req, res) => {
    const teamId = parseId(req.params.teamId, "teamId");
    const input = createTaskSchema.parse(req.body);
    const task = await createTask(teamId, input);
    res.status(201).json(task);
  })
);

tasksRouter.patch(
  "/teams/:teamId/tasks/:taskId",
  asyncHandler(async (req, res) => {
    const teamId = parseId(req.params.teamId, "teamId");
    const taskId = parseId(req.params.taskId, "taskId");
    const input = updateTaskSchema.parse(req.body);
    const task = await updateTask(teamId, taskId, input);
    res.json(task);
  })
);

tasksRouter.delete(
  "/teams/:teamId/tasks/:taskId",
  asyncHandler(async (req, res) => {
    const teamId = parseId(req.params.teamId, "teamId");
    const taskId = parseId(req.params.taskId, "taskId");
    await deleteTask(teamId, taskId);
    res.status(204).send();
  })
);
