import { IParser, ParseState } from "../IParser";
import { ParseUtils } from "./ParseUtils";

export class MaxColorParser implements IParser<number> {
  private maxColor: number = 0;
  private rawMaxColor: string[] = [];

  parse(char: string): ParseState {
    if (this.rawMaxColor.length && ParseUtils.isEmpty(char)) {
      this.maxColor = parseInt(this.rawMaxColor.join(""));
      return ParseState.RGB;
    }

    if (ParseUtils.isNum(char)) this.rawMaxColor.push(char);

    return ParseState.MAX_COLOR;
  }
  
  result(): number {
    return this.maxColor;
  }
}
