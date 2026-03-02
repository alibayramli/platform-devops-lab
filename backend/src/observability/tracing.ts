import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { NodeSDK } from "@opentelemetry/sdk-node";

import { env } from "../config/env.js";
import { logger } from "./logger.js";

let sdk: NodeSDK | null = null;

export function initTracing(): void {
  if (!env.OTEL_ENABLED) {
    logger.info("OpenTelemetry tracing is disabled");
    return;
  }

  if (!process.env.OTEL_SERVICE_NAME) {
    process.env.OTEL_SERVICE_NAME = env.APP_NAME;
  }

  sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
      url: `${env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`
    }),
    instrumentations: [getNodeAutoInstrumentations()]
  });

  sdk.start();
  logger.info({ endpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT }, "OpenTelemetry tracing started");
}

export async function shutdownTracing(): Promise<void> {
  if (!sdk) {
    return;
  }

  await sdk.shutdown();
  sdk = null;
  logger.info("OpenTelemetry tracing stopped");
}
