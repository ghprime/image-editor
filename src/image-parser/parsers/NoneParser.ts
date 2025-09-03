import { IParser, ParseState } from "../IParser";

export class NoneParser implements IParser<void> {
  parse(char: string): ParseState {
    return ParseState.NONE;
  }
  
  result(): void {}
}
