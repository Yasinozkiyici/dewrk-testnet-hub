type Primitive = string | number | boolean | bigint | symbol | null | undefined;

function isPojo(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;
}

/**
 * Recursively remove null and undefined entries from objects and arrays.
 * Keeps empty arrays/objects unless they collapse to empty after pruning.
 */
export function prune<T>(input: T): T {
  if (input === null || input === undefined) {
    return input;
  }

  if (Array.isArray(input)) {
    const cleaned = input
      .map((item) => prune(item))
      .filter((item) => item !== null && item !== undefined) as unknown as T;
    return cleaned;
  }

  if (isPojo(input)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      const cleaned = prune(value as Primitive | Record<string, unknown>);
      if (cleaned !== null && cleaned !== undefined) {
        result[key] = cleaned;
      }
    }
    return result as T;
  }

  return input;
}
