import type { Logger } from "pino";
import { logger } from "./logger.js";

export const createLoggerModule = (module: string): Logger<never, boolean> => {
  return logger.child({ module: module });
};
