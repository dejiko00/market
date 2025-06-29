const log = async () => {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  console.log("log");
};
const worker = new Worker("scraping", async (_job) => await log(), {
  connection,
});
