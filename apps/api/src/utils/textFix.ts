import capitalize from "./capitalize.js";

const textFix = (str: string) => capitalize(str.trim().replaceAll(/\s+/g, " "));

export default textFix;
