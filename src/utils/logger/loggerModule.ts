import logger from "./logger";

const createLoggerModule = (module: string) => {
  return logger.child({ module });
};
export default createLoggerModule;
