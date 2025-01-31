function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function parseSnakeToCamel<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => parseSnakeToCamel(item)) as T;
  } else if (input !== null && typeof input === 'object') {
    return Object.keys(input).reduce((acc, key) => {
      const camelKey = toCamelCase(key);
      acc[camelKey] = parseSnakeToCamel((input as any)[key]);
      return acc;
    }, {} as any) as T;
  }
  return input;
}
