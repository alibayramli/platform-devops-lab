import { env } from "./config/env.js";
import { closePool } from "./db/pool.js";
import { logger } from "./observability/logger.js";
import { initTracing, shutdownTracing } from "./observability/tracing.js";

let shuttingDown = false;

async function shutdownResources(): Promise<void> {
  const results = await Promise.allSettled([shutdownTracing(), closePool()]);

  for (const result of results) {
    if (result.status === "rejected") {
      logger.error({ err: result.reason }, "Failed to shut down application resource");
    }
  }
}

async function start(): Promise<void> {
  initTracing();

  const [{ app }, { runMigrations }] = await Promise.all([
    import("./app.js"),
    import("./db/migrations.js")
  ]);

  await runMigrations();

  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "API listening");
  });

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

  process.on("SIGINT", () => {
    handleShutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    handleShutdown("SIGTERM");
  });
}

start().catch((error) => {
  logger.fatal({ err: error }, "Failed to start API");
  void shutdownResources().finally(() => process.exit(1));
});
