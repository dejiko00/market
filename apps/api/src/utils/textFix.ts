import capitalize from "./capitalize";

const textFix = (str: string) => capitalize(str.trim().replaceAll(/\s+/g, " "));

export default textFix;
