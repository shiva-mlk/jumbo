// Narrows to a plain object, excluding arrays and null.
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// Returns a trimmed string, or undefined when absent, blank or not a string.
export function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined
}

// Treats only a literal `true` as true, so missing flags default to false.
export function asBoolean(value: unknown): boolean {
  return value === true
}
