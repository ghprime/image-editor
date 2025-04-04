import { Color } from "../../Image";
import { IParser, ParseState } from "../IParser";
import { HeightParser } from "./HeightParser";
import { ParseUtils } from "./ParseUtils";
import { WidthParser } from "./WidthParser";

enum RGBState {
  RED,
  GREEN,
  BLUE,
}

export class RGBParser implements IParser<Color[][]> {
  private widthParser: WidthParser;
  private heightParser: HeightParser;
  private colors!: Color[][];

  private red: string[] = [];
  private green: string[] = [];
  private blue: string[] = [];

  private x = 0;
  private y = 0;

  private state = RGBState.RED;

  constructor(widthParser: WidthParser, heightParser: HeightParser) {
    this.widthParser = widthParser;
    this.heightParser = heightParser;
  }

  parse(char: string): ParseState {
    if (!this.colors) this.colors = new Array(this.widthParser.result())
      .fill(undefined)
      .map(() => new Array(this.heightParser.result()).fill(undefined));

    if (ParseUtils.isEmpty(char)) {
      switch (this.state) {
        case RGBState.RED:
          if (!this.red.length) break;
          this.state = RGBState.GREEN;
          break;
        case RGBState.GREEN:
          if (!this.green.length) break;
          this.state = RGBState.BLUE;
          break;
        case RGBState.BLUE: {
          if (!this.blue.length) break;
          this.state = RGBState.RED;

          const red = +this.red.join("");
          const green = +this.green.join("");
          const blue = +this.blue.join("");

          this.colors[this.x++][this.y] = {
            red,
            green,
            blue,
          };

          this.red = [];
          this.green = [];
          this.blue = [];

          if (this.x === this.widthParser.result()) {
            this.x = 0;
            ++this.y;
          }

          break;
        }
      }
    } else if (ParseUtils.isNum(char)) {
      switch (this.state) {
        case RGBState.RED:
          this.red.push(char);
          break;
        case RGBState.GREEN:
          this.green.push(char);
          break;
        case RGBState.BLUE:
          this.blue.push(char);
          break;
      }
    }
    return ParseState.RGB;
  }

  result(): Color[][] {
    return this.colors;
  }
}
