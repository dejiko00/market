//import { createRequire } from "node:module";
import { type TransportTargetOptions, pino } from "pino";

//const require = createRequire(import.meta.url);
//const pino = require("pino");

const PATH_LOGS_INFO = "./logs/dev.info.log";
const PATH_LOGS_DEBUG = "./logs/dev.debug.log";
const PATH_LOGS_ERR = "./logs/dev.err.log";

type TransportConfig = TransportTargetOptions & { enabled: boolean };
const ENV = process.env.NODE_ENV || "development";

const transports: TransportConfig[] = [
  {
    target: "pino-pretty",
    enabled: ENV === "development",
    options: {
      colorize: true,
    },
  },
  {
    target: "pino/file",
    level: "info",
    enabled: ENV === "development",
    options: {
      destination: PATH_LOGS_INFO,
      mkdir: true,
    },
  },
  {
    target: "pino/file",
    level: "error",
    enabled: ENV === "development",
    options: {
      destination: PATH_LOGS_ERR,
      mkdir: true,
    },
  },
  {
    target: "pino/file",
    level: "debug",
    enabled: ENV === "development",
    options: {
      destination: PATH_LOGS_DEBUG,
      mkdir: true,
    },
  },
];

export const logger = pino(
  {
    level: "debug",
  },
  pino.transport({
    dedupe: true,
    targets: transports.filter((t) => t.enabled),
  })
);
