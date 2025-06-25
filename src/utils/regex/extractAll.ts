export default function extractAll(regex: RegExp) {
  return (str: string) => [...str.matchAll(regex)].map((m) => m[1]);
}
