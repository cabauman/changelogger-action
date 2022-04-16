import { IInputRetriever } from '../contracts/interfaces'
import { ActionInput } from '../contracts/types'

export const SUPPORTED_MARKDOWN_FLAVORS: string[] = ['github', 'slack']
export const IS_CONVENTIONAL = 'is-conventional'
export const MAX_COMMITS = 'max-commits'
export const MARKDOWN_FLAVOR = 'markdown-flavor'
export const PREAMBLE = 'preamble'
export const TOKEN = 'token'

export default function retrieveAndValidateInput(inputRetriever: IInputRetriever): ActionInput {
  const input: ActionInput = {
    isConventional: inputRetriever.getBooleanInput(IS_CONVENTIONAL),
    maxCommits: inputRetriever.getInput(MAX_COMMITS),
    markdownFlavor: inputRetriever.getInput(MARKDOWN_FLAVOR),
    preamble: inputRetriever.getInput(PREAMBLE),
    token: inputRetriever.getInput(TOKEN),
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
