import IORedis from "ioredis";
import { validateAndGetEnv } from "@/infra/env.js";

let queueConnection: IORedis | null = null;

export function getQueueConnection(): IORedis {
  if (queueConnection) return queueConnection;
  const env = validateAndGetEnv();
  queueConnection = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
  return queueConnection;
}
