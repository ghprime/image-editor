import { IParser, ParseState } from "../IParser";
import { ParseUtils } from "./ParseUtils";

export class HeightParser implements IParser<number> {
  private height: number = 0;
  private rawHeight: string[] = [];
  
  parse(char: string): ParseState {
    if (this.rawHeight.length && ParseUtils.isEmpty(char)) {
      this.height = parseInt(this.rawHeight.join(""));
      return ParseState.MAX_COLOR;
    }

    if (ParseUtils.isNum(char)) this.rawHeight.push(char);

    return ParseState.HEIGHT;
  }

  result(): number {
    return this.height;
  }
}
