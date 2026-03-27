import { Queue } from "bullmq";
import { getQueueConnection } from "./connection.js";
import type { DialerResultsJobPayload, DialerSyncJobPayload } from "./job-types.js";

export const dialerSyncQueue = new Queue<DialerSyncJobPayload>("dialer-sync-queue", {
  connection: getQueueConnection(),
});

export const dialerResultsQueue = new Queue<DialerResultsJobPayload>("dialer-results-queue", {
  connection: getQueueConnection(),
});
