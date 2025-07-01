import { dataSource } from "models";

export const connectionDatabase = await dataSource.initialize();
