import { Image } from "..";
import { ParseState } from "./IParser";
import { HeightParser, MaxColorParser, NoneParser, TypeParser, WidthParser } from "./parsers";
import { RGBParser } from "./parsers/RGBParser";

export class ImageParser {
  private state = ParseState.TYPE;

  parse(buffer: Buffer<ArrayBufferLike>): Image {
    const rawLines = buffer.toString();

    const typeParser = new TypeParser();
    const widthParser = new WidthParser();
    const heightParser = new HeightParser();
    const maxColorParser = new MaxColorParser();
    const noneParser = new NoneParser();
    const rgbParser = new RGBParser(widthParser, heightParser);

    const parsers = {
      [ParseState.TYPE]: typeParser,
      [ParseState.WIDTH]: widthParser,
      [ParseState.HEIGHT]: heightParser,
      [ParseState.NONE]: noneParser,
      [ParseState.MAX_COLOR]: maxColorParser,
      [ParseState.RGB]: rgbParser,
    } as const;

    for (const char of rawLines) {
      if (!parsers[this.state]) break;
      this.state = parsers[this.state].parse(char);
    }

    return new Image(heightParser.result(), widthParser.result(), rgbParser.result());
  }
}
