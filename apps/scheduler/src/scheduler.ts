import {} from "@mkt-lib/models";
import { type ConnectionOptions, Queue, QueueEvents } from "bullmq";

const connection: ConnectionOptions = { host: "localhost", port: 6379 };

const queue = new Queue("scraping", { connection });
const queueEvents = new QueueEvents("scraping", { connection });
queueEvents
  .on("completed", ({ jobId }) => {
    console.log(`${jobId} completed.`);
  })
  .on("progress", ({ jobId, data }) => {
    console.log(`${jobId} progress: ${data.toString()}`);
  });

const initScheduler = async () => {
  const job = await queue.upsertJobScheduler(EMMSA_URL, {
    every: 1000 * 5,
    limit: 2,
  });
};

initScheduler();
