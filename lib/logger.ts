/* eslint-disable no-console */
type LogMetadata = Record<string, unknown>;

export const logger = {
  info(message: string, meta?: LogMetadata) {
    if (process.env.NODE_ENV !== "test") {
      console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta) : "");
    }
  },
  warn(message: string, meta?: LogMetadata) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(`[WARN] ${message}`, meta ? JSON.stringify(meta) : "");
    }
  },
  error(message: string, error?: Error | unknown, meta?: LogMetadata) {
    if (process.env.NODE_ENV !== "test") {
      console.error(
        `[ERROR] ${message}`,
        error instanceof Error ? error.stack || error.message : error,
        meta ? JSON.stringify(meta) : ""
      );
    }
    // Future integration point: e.g. Sentry.captureException(error, { extra: meta })
  },
  debug(message: string, meta?: LogMetadata) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${message}`, meta ? JSON.stringify(meta) : "");
    }
  },
};
