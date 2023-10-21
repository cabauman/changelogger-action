import * as core from '@actions/core'
import CommitHashCalculator from '../helpers/commitHashCalculator'
import { CommitRefRange, ActionContext } from '../contracts/types'
import { BranchComparisonStrategy } from '../config/getInput'

export default class CommitRefRangeCalculator {
  constructor(
    private readonly input: CommitRefRangeCalculatorInput,
    private readonly commitHashCalculator: CommitHashCalculator,
    private readonly previousTagProvider: (
      currentTag: string,
    ) => Promise<string | undefined>,
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
      }
    } else if (githubRef.startsWith('refs/tags/')) {
      const tagName = githubRef.slice('refs/tags/'.length)
      currentRef = tagName
      previousRef = await this.previousTagProvider(tagName)
    } else {
      throw new Error(
        `Expected github.context.ref to start with refs/heads/ or refs/tags/ but instead was ${githubRef}`,
      )
    }

    return { currentRef, previousRef }
  }
}

export type CommitRefRangeCalculatorInput = {
  branchComparisonStrategy: BranchComparisonStrategy
  githubRef: string
}
