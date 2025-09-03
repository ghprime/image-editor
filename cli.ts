import { readFileSync } from "node:fs"
import { ImageEditor, ImageParser, Image, ImageWriter } from "./src";

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
