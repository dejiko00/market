import { parse } from "./emmsa/parse.js";
import { pull } from "./emmsa/pull.js";
import { Repository } from "./repository.js";

export class RepositoryEmmsa extends Repository {
  constructor() {
    super("emmsa");
  }

  pull() {
    const url = "https://old.emmsa.com.pe";
    super.pull(url);
    pull(url, this.pathCookies, this.pathHeaders, this.pathResponse);
  }

  parse() {
    super.parse();
    const date = new Date();
    parse({
      logger: this.logger.child(date),
      date,
      pathLogParse: this.pathParsed,
      pathLogResponse: this.pathResponse,
    });
  }
}
