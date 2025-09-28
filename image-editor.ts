import { openSync, readFileSync, writeSync } from "node:fs";

// I had all of these in separate files all pretty like, but
// I didn't want to turn in 11 different files.
// So here I am, with everything in one file

// if you want my full directory with all the files separated,
// go to https://github.com/ghprime/image-editor

export enum ParseState {
  TYPE,
  WIDTH,
  HEIGHT,
  NONE,
  MAX_COLOR,
  RGB,
}

export interface IParser<T> {
  parse(char: string): ParseState;
  result(): T;
}

export class ParseUtils {
  private static nums = new Set(new Array(10).fill("").map((_, index) => `${index}`));

  static isNum(char: string) {
    return this.nums.has(char);
  }

  static isEmpty(char: string) {
    return /\s/.test(char)
  }
}

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

export class NoneParser implements IParser<void> {
  parse(char: string): ParseState {
    return ParseState.NONE;
  }
  
  result(): void {}
}

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

export type Color = {
  red: number;
  green: number;
  blue: number;
};

export class Image {
  private colors: Color[][];
  private width: number;
  private height: number;

  constructor(height: number, width: number, colors: Color[][]) {
    this.height = height;
    this.width = width;
    this.colors = colors;
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  get(x: number, y: number) {
    return this.colors[x][y];
  }

  set(x: number, y: number, color: Color) {
    this.colors[x][y] = color;
  }

  copy(): Image {
    const copyColors = this.colors.map(col => col.map(color => ({ ...color })));

    const copy = new Image(this.height, this.width, copyColors);

    return copy;
  }
}

export class ImageEditor {
  motionblur(image: Image, length: number): Image {
    image = image.copy();
    if (length < 1) return image;

    for (let x = 0; x < image.getWidth(); ++x) {
      for (let y = 0; y < image.getHeight(); ++y) {
        const curColor = image.get(x, y);

        const maxX = Math.min(image.getWidth() - 1, x + length - 1);
        for (let i = x + 1; i <= maxX; ++i) {
          const tempColor = image.get(i, y);
          curColor.red += tempColor.red;
          curColor.green += tempColor.green;
          curColor.blue += tempColor.blue;
        }

        const delta = maxX - x + 1;
        curColor.red = Math.floor(curColor.red / delta);
        curColor.green = Math.floor(curColor.green / delta);
        curColor.blue = Math.floor(curColor.blue / delta);

        image.set(x, y, curColor);
      }
    }

    return image;
  }

  invert(image: Image): Image {
    image = image.copy();

    for (let x = 0; x < image.getWidth(); ++x) {
      for (let y = 0; y < image.getHeight(); ++y) {
        const curColor = image.get(x, y);

        curColor.red = 255 - curColor.red;
        curColor.green = 255 - curColor.green;
        curColor.blue = 255 - curColor.blue;

        image.set(x, y, curColor);
      }
    }

    return image;
  }

  grayscale(image: Image): Image {
    image = image.copy();

    for (let x = 0; x < image.getWidth(); ++x) {
      for (let y = 0; y < image.getHeight(); ++y) {
        const curColor = image.get(x, y);

        let grayLevel = Math.floor((curColor.red + curColor.green + curColor.blue) / 3);
        
        grayLevel = Math.max(0, Math.min(grayLevel, 255));

        curColor.red = grayLevel;
        curColor.green = grayLevel;
        curColor.blue = grayLevel;

        image.set(x, y, curColor);
      }
    }

    return image;
  }

  emboss(image: Image): Image {
    image = image.copy();

    for (let x = image.getWidth() - 1; x >= 0; --x) {
      for (let y = image.getHeight() - 1; y >= 0; --y) {
        const curColor = image.get(x, y);

        let diff = 0;
        if (x > 0 && y > 0) {
          const upLeftColor = image.get(x - 1, y - 1);
          if (Math.abs(curColor.red - upLeftColor.red) > Math.abs(diff)) {
            diff = curColor.red - upLeftColor.red;
          }
          if (Math.abs(curColor.green - upLeftColor.green) > Math.abs(diff)) {
            diff = curColor.green - upLeftColor.green;
          }
          if (Math.abs(curColor.blue - upLeftColor.blue) > Math.abs(diff)) {
            diff = curColor.blue - upLeftColor.blue;
          }
        }

        let grayLevel = 128 + diff;
        grayLevel = Math.max(0, Math.min(grayLevel, 255));

        curColor.red = grayLevel;
        curColor.green = grayLevel;
        curColor.blue = grayLevel;

        image.set(x, y, curColor);
      }
    }

    return image;
  }
}

export class ImageWriter {
  write(image: Image, location: string) {
    let toWrite: string[] = [
      `P3\n${image.getWidth()} ${image.getHeight()}\n255\n`,
    ];

    for (let y = 0; y < image.getHeight(); ++y) {
      for (let x = 0; x < image.getWidth(); ++x) {
        const colors = image.get(x, y);

        toWrite.push(`${x === 0 ? "" : " "}${colors.red} ${colors.green} ${colors.blue}`)
      }
      toWrite.push("\n");
    }

    const fd = openSync(location, "w");

    writeSync(fd, toWrite.join(""));
  }
}

const getUsage = () => {
  return "USAGE: typescript ImageEditor <in-file> <out-file> <grayscale|invert|emboss|motionblur {motion-blur-length}";
}

type Command = {
  args: number;
  func: (image: Image) => Image;
}

const edit = (args: string[]) => {
  if (args.length < 3) {
    throw new Error(getUsage());
  }

  try {
    const [inputFile, outputFile, filter] = args;

    const file = readFileSync(inputFile);

    const image = new ImageParser().parse(file);

    const imageEditor = new ImageEditor();

    const motionblur: Command = {
      args: 4,
      func: (image: Image) => imageEditor.motionblur(image, +args[3]),
    };

    const invert: Command = {
      args: 3,
      func: imageEditor.invert,
    }

    const grayscale: Command = {
      args: 3,
      func: imageEditor.grayscale,
    };

    const emboss: Command = {
      args: 3,
      func: imageEditor.emboss,
    }

    const commands: Record<string, Command> = {
      motionblur,
      invert,
      grayscale,
      greyscale: grayscale,
      emboss,
    }

    if (!commands[filter]) {
      throw new Error(getUsage());
    }

    const filteredImage = commands[filter].func(image);

    const imageWriter = new ImageWriter();
    imageWriter.write(image, outputFile);
    imageWriter.write(filteredImage, outputFile);
  } catch (e) {
    console.error(e);
  }
}

edit(process.argv.slice(2));
