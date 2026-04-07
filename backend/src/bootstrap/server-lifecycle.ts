import type { Server } from "node:http";

import { closePool } from "../db/pool.js";
import { logger } from "../observability/logger.js";
import { shutdownTracing } from "../observability/tracing.js";

export async function shutdownResources(): Promise<void> {
  const results = await Promise.allSettled([shutdownTracing(), closePool()]);

  for (const result of results) {
    if (result.status === "rejected") {
      logger.error({ err: result.reason }, "Failed to shut down application resource");
    }
  }
}

export function registerProcessShutdownHandlers(server: Server): void {
  let shuttingDown = false;

  const handleShutdown = (signal: NodeJS.Signals): void => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    logger.info({ signal }, "Shutting down API server");

    server.close((closeError) => {
      if (closeError) {
        logger.error({ err: closeError }, "Failed to close HTTP server cleanly");
      }

      void shutdownResources().finally(() => {
        process.exit(closeError ? 1 : 0);
      });
    });
  };

  process.once("SIGINT", () => {
    handleShutdown("SIGINT");
  });

  process.once("SIGTERM", () => {
    handleShutdown("SIGTERM");
  });
}
