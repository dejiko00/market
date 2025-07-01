import { type ConnectionOptions, Queue, QueueEvents } from "bullmq";

const connection: ConnectionOptions = { host: "localhost", port: 6379 };

export class Scheduler {
  private label: string;
  private queue: Queue;
  private queueEvents!: QueueEvents;
  //private jobs: Job[] = [];

  constructor(label: string) {
    this.label = label;
    this.queue = new Queue(label, { connection });
  }

  async addJob(jobLabel: string) {
    //await this.queue.upsertJobScheduler(jobLabel, {
    //every: 1000 * 5,
    //limit: 5,
    //immediately: false,
    //});
    //this.jobs.push(job);

    await this.queue.upsertJobScheduler(
      jobLabel,
      {
        every: 1000 * 10,
      },
      {
        data: {
          repository: "emmsa",
        },
      }
    );
  }

  async listen() {
    let count = 0;
    this.queueEvents = new QueueEvents(this.label, { connection });
    this.queueEvents.on("completed", ({ jobId }) => {
      console.log(`${jobId} completed ${count}.`);
      ++count;
    });
    this.queueEvents.on("added", ({ jobId }) => {
      console.log(`${jobId} added.`);
    });
  }
}
