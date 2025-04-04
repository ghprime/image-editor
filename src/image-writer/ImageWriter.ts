import { Image } from "../Image";
import { openSync, writeSync } from "node:fs";

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
