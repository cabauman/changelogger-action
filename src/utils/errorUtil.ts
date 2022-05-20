export function error2Json(error: Error | unknown | null | undefined): string {
  if (error == null) {
    return ''
  }
  return JSON.stringify(error, jsonFriendlyErrorReplacer)
}

export function error2Obj(
  error: Error | unknown | null | undefined,
): Record<string, unknown> {
  const json = error2Json(error)
  return JSON.parse(json)
}

function jsonFriendlyErrorReplacer(key: string, value: unknown) {
  if (value instanceof Error) {
    return {
      // Pull all enumerable properties, supporting properties on custom Errors.
      ...value,
      // Explicitly pull Error's non-enumerable properties, except stack.
      name: value.name,
      message: value.message,
    }
  }

  return value
}
