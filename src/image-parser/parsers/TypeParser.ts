import { IParser, ParseState } from "../IParser";
import { ParseUtils } from "./ParseUtils";

export class TypeParser implements IParser<string> {
  private rawType: string[] = [];
  private type = "";
  parse(char: string) {
    if (this.rawType.length && ParseUtils.isEmpty(char)) {
      this.type = this.rawType.join("");
      if (this.type !== "P3") throw new Error(`Unknown type "${this.type}"`);
      return ParseState.WIDTH;
    }

    if (!ParseUtils.isEmpty(char)) this.rawType.push(char);

    return ParseState.TYPE;
  }

  result() {
    return this.type;
  }
}
