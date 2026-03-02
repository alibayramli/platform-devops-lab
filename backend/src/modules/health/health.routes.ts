import { Router } from "express";
import { sql } from "drizzle-orm";

import { db } from "../../db/pool.js";
import { asyncHandler } from "../../shared/async-handler.js";

export const healthRouter = Router();

healthRouter.get(
  "/health",
  asyncHandler(async (_req, res) => {
    const result = await db.execute<{ dbTime: string }>(sql`SELECT NOW()::text AS "dbTime"`);
    res.json({ status: "ok", dbTime: result.rows[0]?.dbTime ?? null });
  })
);
