import { env } from "./config/env.js";
import {
  registerProcessShutdownHandlers,
  shutdownResources
} from "./bootstrap/server-lifecycle.js";
import { logger } from "./observability/logger.js";
import { initTracing } from "./observability/tracing.js";

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
  registerProcessShutdownHandlers(server);
}

start().catch((error) => {
  logger.fatal({ err: error }, "Failed to start API");
  void shutdownResources().finally(() => process.exit(1));
});
