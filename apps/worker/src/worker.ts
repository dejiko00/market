import { ConnectionOptions, Worker } from "bullmq";

const connection: ConnectionOptions = { host: "localhost", port: 6379 };

const log = async () => {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  console.log("log");
};

export const newWorker = () => {
  new Worker("scraping", async (_job) => await log(), {
    connection,
  });
};
