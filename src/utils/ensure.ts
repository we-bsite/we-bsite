/**
 * Helper to check that a given value is defined, that is, is neither `undefined` nor `null`.
 * If the value is `undefined` or `null`, an error will be raised at runtime.
 *
 * This is typically used to inform TypeScript that you expect a given value to always exist.
 * Calling this function refines a type that can otherwise be null or undefined.
 */
export function ensureExists<T>(
  value: T | null | undefined,
  message?: string
): T {
  if (typeof value === "undefined" || value === null) {
    throw new Error(message || `Expected value for ${String(value)}`);
  }
  return value;
}
