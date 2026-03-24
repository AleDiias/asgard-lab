type LogLevel = "info" | "warn" | "error" | "debug";

interface LogPayload {
  level: LogLevel;
  message: string;
  tenantDomain?: string;
  [key: string]: unknown;
}

function log(payload: LogPayload): void {
  const line = JSON.stringify({
    ...payload,
    timestamp: new Date().toISOString(),
  });
  // eslint-disable-next-line no-console
  console.log(line);
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    log({ level: "info", message, ...meta });
  },
  warn(message: string, meta?: Record<string, unknown>): void {
    log({ level: "warn", message, ...meta });
  },
  error(message: string, meta?: Record<string, unknown>): void {
    log({ level: "error", message, ...meta });
  },
  debug(message: string, meta?: Record<string, unknown>): void {
    log({ level: "debug", message, ...meta });
  },
};
