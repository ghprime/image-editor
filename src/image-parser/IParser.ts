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
