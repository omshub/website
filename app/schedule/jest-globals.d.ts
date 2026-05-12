declare const describe: (name: string, fn: () => void) => void;

interface JestIt {
  (name: string, fn: () => void): void;
}

declare const it: JestIt;

interface JestExpectation {
  not: {
    toContain(expected: unknown): void;
  };
  toBe(expected: unknown): void;
  toBeDefined(): void;
  toContain(expected: unknown): void;
  toEqual(expected: unknown): void;
  toHaveLength(expected: number): void;
}

declare const expect: (actual: unknown) => JestExpectation;
