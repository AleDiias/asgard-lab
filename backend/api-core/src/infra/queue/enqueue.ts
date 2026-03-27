import { dialerSyncQueue } from "./queues.js";
import type { DialerSyncJobPayload } from "./job-types.js";

export async function enqueueDialerSyncJob(payload: DialerSyncJobPayload): Promise<void> {
  await dialerSyncQueue.add("dialer-sync", payload, {
    removeOnComplete: 200,
    removeOnFail: 200,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 500,
    },
  });
}
