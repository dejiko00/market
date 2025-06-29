import logger from "./logger.js";

const createLoggerModule = (module: string) => {
  return logger.child({ module });
};
export default createLoggerModule;
