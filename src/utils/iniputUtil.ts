export function validateNumber(value: string) {
  if (
    value === '' ||
    !Number.isInteger(Number(value)) ||
    value.startsWith('0b') ||
    value.startsWith('0x') ||
    value.startsWith('0o')
  ) {
    throw new Error(`Invalid value '${value}' for number input.`)
  }
}
