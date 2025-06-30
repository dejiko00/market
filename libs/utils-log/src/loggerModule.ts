import type { Logger } from "pino";
import { logger } from "./logger.js";

export const createLoggerModule = (module: string): Logger<string, boolean> => {
  return logger.child({ module: module });
};
