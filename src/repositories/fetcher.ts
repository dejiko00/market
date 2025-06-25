import { parse } from "./emmsa/parse";

const date = new Date();
parse(date).then((res) => console.log(res));
