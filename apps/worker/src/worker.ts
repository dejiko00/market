import { type ConnectionOptions, Worker } from "bullmq";
import { RepositoryEmmsa } from "./repositories/emmsa.js";
import { logger } from "./utils/logger.js";

const connection: ConnectionOptions = { host: "localhost", port: 6379 };

export const createWorker = () => {
  logger.info("New worker created");
  return new Worker(
    "scraping-queue",
    async (job, token) => {
      3;
      const loggerJob = logger.child({ token });
      loggerJob.info("Starting job.");

      const repository = job.data.repository;

      switch (repository) {
        case "emmsa": {
          const repository = new RepositoryEmmsa();
          //repository.pull()
          repository.parse();
          break;
        }
        default:
          loggerJob.error("Couldn't find repository.");
      }
    },
    {
      connection,
      autorun: false,
    }
  ).run();
};
