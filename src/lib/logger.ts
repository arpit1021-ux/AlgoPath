type LogLevel = "info" | "warn" | "error";

export function log(level: LogLevel, message: string, data?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, level, message, ...data };
  if (process.env.NODE_ENV === "production") {
    console[level](JSON.stringify(logEntry));
  } else {
    console[level](`[${timestamp}] ${message}`, data || "");
  }
}

export function logError(error: unknown, context?: Record<string, unknown>) {
  const err = error instanceof Error ? error : new Error(String(error));
  log("error", err.message, { stack: err.stack, ...context });
}
