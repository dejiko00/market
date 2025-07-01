import { createWorker } from "./worker.js";

createWorker();
process.on("beforeExit", () => {
  console.log("exiting");
});
