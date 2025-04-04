export class ParseUtils {
  private static nums = new Set(new Array(10).fill("").map((_, index) => `${index}`));

  static isNum(char: string) {
    return this.nums.has(char);
  }

  static isEmpty(char: string) {
    return /\s/.test(char)
  }
}