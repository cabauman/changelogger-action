import * as core from '@actions/core'
import CommitHashCalculator from '../helpers/commitHashCalculator'
import { CommitRefRange, ActionContext } from '../contracts/types'

// TODO: Consider splitting this into 3 distinct implementations of an interface,
// one of which is chosen at composition time.
export default class CommitRefRangeCalculator {
  constructor(
    private readonly input: CommitRefRangeCalculatorInput,
    private readonly commitHashCalculator: CommitHashCalculator,
    private readonly previousTagProvider: (currentTag: string) => Promise<string>,
  ) {}
  public async execute(): Promise<CommitRefRange> {
    let currentRef: string | undefined
    let previousRef: string | undefined

    const githubRef = this.input.githubRef
    if (githubRef.startsWith('refs/heads/')) {
      const branchName = githubRef.slice('refs/heads/'.length)
      currentRef = branchName
      if (this.input.branchComparisonStrategy === 'tag') {
        previousRef = await this.previousTagProvider(branchName)
      } else if (this.input.branchComparisonStrategy === 'workflow') {
        previousRef = await this.commitHashCalculator.execute(branchName)
      } else {
        throw new Error(
          `Unsupported branchComparisonStrategy: ${this.input.branchComparisonStrategy}`,
        )
      }
    } else if (githubRef.startsWith('refs/tags/')) {
      const tagName = githubRef.slice('refs/tags/'.length)
      currentRef = tagName
      try {
        previousRef = await this.previousTagProvider(tagName)
      } catch (error) {
        core.info(`This is the first commit so there are no earlier commits to compare to.`)
      }
    } else if (githubRef.startsWith('refs/pull/')) {
      previousRef = this.input.prTarget ? 'origin/' + this.input.prTarget : undefined
      currentRef = this.input.prSource ? 'origin/' + this.input.prSource : undefined
    } else {
      throw new Error(
        `Expected github.context.ref to start with refs/heads/ or refs/tags/ but instead was ${githubRef}`,
      )
    }

    return { currentRef, previousRef }
  }
}

export type CommitRefRangeCalculatorInput = {
  // Consider enforcing type: 'tag' | 'workflow'
  branchComparisonStrategy: string
  githubRef: string
  prTarget: string | undefined
  prSource: string | undefined
}
