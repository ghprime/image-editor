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
