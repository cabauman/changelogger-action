import { IInputRetriever } from '../contracts/interfaces'
import { ActionInput } from '../contracts/types'

// TODO: Implement markdown flavor.
export const SUPPORTED_OUTPUT_FLAVORS = ['github-release', 'markdown', 'slack'] as const
export type OutputFlavor = typeof SUPPORTED_OUTPUT_FLAVORS[number]

export const SUPPORTED_BRANCH_COMPARISON_STRATEGIES = ['tag', 'workflow'] as const
export type BranchComparisonStrategy = typeof SUPPORTED_BRANCH_COMPARISON_STRATEGIES[number]

export const IS_CONVENTIONAL = 'is-conventional'
export const OUTPUT_FLAVOR = 'output-flavor'
export const PREAMBLE = 'preamble'
export const TOKEN = 'token'
export const BRANCH_COMPARISON_STRATEGY = 'branch-comparison-strategy'

export default function retrieveAndValidateInput(inputRetriever: IInputRetriever): ActionInput {
  const isConventional = inputRetriever.getBooleanInput(IS_CONVENTIONAL)
  const rawOutputFlavor = inputRetriever.getInput(OUTPUT_FLAVOR)
  const preamble = inputRetriever.getInput(PREAMBLE)
  const token = inputRetriever.getInput(TOKEN)
  const rawBranchComparisonStrategy = inputRetriever.getInput(BRANCH_COMPARISON_STRATEGY)

  validateToken(token)
  const outputFlavor = validateOutputFlavor(rawOutputFlavor)
  const branchComparisonStrategy = validateBranchComparisonStrategy(rawBranchComparisonStrategy)

  return {
    isConventional,
    outputFlavor,
    preamble,
    token,
    branchComparisonStrategy,
  }
}

function validateOutputFlavor(value: string): OutputFlavor {
  if (!SUPPORTED_OUTPUT_FLAVORS.includes(value as OutputFlavor)) {
    throw new Error(
      `Invalid value '${value}' for 'output-flavor' input. It must be one of ${SUPPORTED_OUTPUT_FLAVORS}`,
    )
  }
  return value as OutputFlavor
}

function validateToken(value: string) {
  if (value === '') {
    throw new Error(`Invalid value '${value}' for 'token' input.`)
  }
}

function validateBranchComparisonStrategy(value: string): BranchComparisonStrategy {
  if (!SUPPORTED_BRANCH_COMPARISON_STRATEGIES.includes(value as BranchComparisonStrategy)) {
    throw new Error(
      `Invalid value '${value}' for 'branch-comparison-strategy' input. ` +
        `It must be one of ${SUPPORTED_BRANCH_COMPARISON_STRATEGIES}`,
    )
  }
  return value as BranchComparisonStrategy
}
