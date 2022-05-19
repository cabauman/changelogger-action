import { IInputRetriever } from '../contracts/interfaces'
import { ActionInput } from '../contracts/types'

// TODO: Implement markdown flavor.
export const SUPPORTED_OUTPUT_FLAVORS: string[] = ['github-release', 'markdown', 'slack']
export const SUPPORTED_BRANCH_COMPARISON_STRATEGIES: string[] = ['tag', 'workflow']
export const IS_CONVENTIONAL = 'is-conventional'
export const OUTPUT_FLAVOR = 'output-flavor'
export const PREAMBLE = 'preamble'
export const TOKEN = 'token'
export const BRANCH_COMPARISON_STRATEGY = 'branch-comparison-strategy'

export default function retrieveAndValidateInput(inputRetriever: IInputRetriever): ActionInput {
  const input: ActionInput = {
    isConventional: inputRetriever.getBooleanInput(IS_CONVENTIONAL),
    outputFlavor: inputRetriever.getInput(OUTPUT_FLAVOR),
    preamble: inputRetriever.getInput(PREAMBLE),
    token: inputRetriever.getInput(TOKEN),
    branchComparisonStrategy: inputRetriever.getInput(BRANCH_COMPARISON_STRATEGY),
  }
  validateOutputFlavor(input.outputFlavor)
  validateToken(input.token)
  validateBranchComparisonStrategy(input.branchComparisonStrategy)

  return input
}

function validateOutputFlavor(value: string) {
  if (!SUPPORTED_OUTPUT_FLAVORS.includes(value)) {
    throw new Error(
      `Invalid value '${value}' for 'output-flavor' input. It must be one of ${SUPPORTED_OUTPUT_FLAVORS}`,
    )
  }
}

function validateToken(value: string) {
  if (value === '') {
    throw new Error(`Invalid value '${value}' for 'token' input.`)
  }
}

function validateBranchComparisonStrategy(value: string) {
  if (!SUPPORTED_BRANCH_COMPARISON_STRATEGIES.includes(value)) {
    throw new Error(
      `Invalid value '${value}' for 'branch-comparison-strategy' input. ` +
        `It must be one of ${SUPPORTED_BRANCH_COMPARISON_STRATEGIES}`,
    )
  }
}
