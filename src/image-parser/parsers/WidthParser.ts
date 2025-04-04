import { IParser, ParseState } from "../IParser";
import { ParseUtils } from "./ParseUtils";

export class WidthParser implements IParser<number> {
  private width: number = 0;
  private rawWidth: string[] = [];
  parse(char: string): ParseState {
    if (this.rawWidth.length && ParseUtils.isEmpty(char)) {
      this.width = parseInt(this.rawWidth.join(""));
      return ParseState.HEIGHT;
    }

    if (ParseUtils.isNum(char)) this.rawWidth.push(char);

    return ParseState.WIDTH;
  }
  result(): number {
    return this.width;
  }

}