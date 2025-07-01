import { Scheduler } from "./scheduler.js";

const scheduler = new Scheduler("scraping-queue");
await scheduler.listen();
await scheduler.addJob("Daily");
