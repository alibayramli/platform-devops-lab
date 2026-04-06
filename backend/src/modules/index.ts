import type { Express, Router } from "express";

import { healthRouter } from "./health/health.routes.js";
import { membersRouter } from "./members/members.routes.js";
import { tasksRouter } from "./tasks/tasks.routes.js";
import { teamsRouter } from "./teams/teams.routes.js";

type RegisteredRouter = {
  path: string;
  router: Router;
};

const registeredRouters: RegisteredRouter[] = [
  { path: "/", router: healthRouter },
  { path: "/api", router: teamsRouter },
  { path: "/api", router: membersRouter },
  { path: "/api", router: tasksRouter }
];

export function registerAppRouters(app: Express): void {
  for (const { path, router } of registeredRouters) {
    app.use(path, router);
  }
}
