import { Image } from "../Image";

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
