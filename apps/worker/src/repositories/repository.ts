import type { Logger } from "pino";
import { logger } from "../utils/logger.js";

export class Repository {
  label: string;
  logger: Logger;
  url!: string;
  pathCookies!: string;
  pathHeaders!: string;
  pathResponse!: string;
  pathParsed!: string;

  constructor(label: string) {
    this.label = label;
    this.logger = logger.child({
      repository: this.label,
    });
    this.createLogPaths(label);
  }

  private createLogPaths(label: string) {
    this.pathCookies = `./logs/${label}.cookies.txt`;
    this.pathHeaders = `./logs/${label}.headers.txt`;
    this.pathResponse = `./logs/${label}.response.txt`;
    this.pathParsed = `./logs/${label}.parsed.txt`;
  }

  // biome-ignore lint/suspicious/noExplicitAny: Freeform data
  log(msg: string, data?: any) {
    this.logger.info(msg, data);
  }

  // biome-ignore lint/suspicious/noExplicitAny: Freeform data
  error(msg: string, data?: any) {
    this.logger.error(msg, data);
  }

  pull(url: string) {
    this.url = url;
    this.logger.info("Executing pull().", url);
  }

  parse() {
    this.logger.info("Executing parse().", this.pathParsed);
  }
}
