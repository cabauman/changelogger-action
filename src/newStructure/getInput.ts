import { IActionInput, IInputRetriever } from './interfaces'

export const SUPPORTED_MARKDOWN_FLAVORS: string[] = ['github', 'slack']

export default function retrieveAndValidateInput(inputRetriever: IInputRetriever): IActionInput {
  const input: IActionInput = {
    isConventional: inputRetriever.getBooleanInput('is-conventional'),
    maxCommits: inputRetriever.getInput('max-commits'),
    markdownFlavor: inputRetriever.getInput('markdown-flavor'),
    preamble: inputRetriever.getInput('preamble'),
    token: inputRetriever.getInput('token'),
  }
  validateMarkdownFlavor(input.markdownFlavor)
  validateMaxCommits(input.maxCommits)
  validateToken(input.token)

  return input
}

function validateMarkdownFlavor(value: string) {
  if (!SUPPORTED_MARKDOWN_FLAVORS.includes(value)) {
    throw new Error(
      `Invalid value '${value}' for 'markdown-flavor' input. It must be one of ${SUPPORTED_MARKDOWN_FLAVORS}`,
    )
  }
}

function validateMaxCommits(value: string) {
  if (
    value === '' ||
    !Number.isInteger(Number(value)) ||
    value.startsWith('0b') ||
    value.startsWith('0x') ||
    value.startsWith('0o')
  ) {
    throw new Error(`Invalid value '${value}' for 'max-commits' input.`)
  }
}

function validateToken(value: string) {
  if (value === '') {
    throw new Error(`Invalid value '${value}' for 'token' input.`)
  }
}
