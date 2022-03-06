import * as core from '@actions/core'
import CommitHashCalculator from './commitHashCalculator'
import { CommitRefRange, IActionContext } from './interfaces'

// TODO: Consider splitting this into 3 distinct implementations of an interface,
// one of which is chosen at composition time.
export default class CommitRefRangeCalculator {
  constructor(
    private readonly context: IActionContext,
    private readonly commitHashCalculator: CommitHashCalculator,
    private readonly previousTagProvider: (currentTag: string) => Promise<string>,
  ) {}
  public async execute(): Promise<CommitRefRange> {
    let currentRef: string | undefined
    let previousRef: string | undefined

    const githubRef = this.context.ref
    if (githubRef.startsWith('refs/heads/')) {
      const branchName = githubRef.slice('refs/heads/'.length)
      currentRef = branchName
      previousRef = await this.commitHashCalculator.execute(branchName)
      if (previousRef == null) {
        core.warning(`Failed to find a previous successful pipeline for ${branchName} branch.`)
      }
    } else if (githubRef.startsWith('refs/tags/')) {
      const tagName = githubRef.slice('refs/tags/'.length)
      currentRef = tagName
      try {
        previousRef = await this.previousTagProvider(tagName)
      } catch (error) {
        core.info(`This is the first commit so there are no earlier commits to compare to.`)
      }
      // TODO: --always causes command to return sha of previous commit if no earler tags exist.
      previousRef = 'origin/' + previousRef
    } else if (githubRef.startsWith('refs/pull/')) {
      previousRef = 'origin/' + this.context.prTarget
      currentRef = 'origin/' + this.context.prSource
    } else {
      throw new Error(
        `Expected github.context.ref to start with refs/heads/ or refs/tags/ but instead was ${githubRef}`,
      )
    }

    return { currentRef, previousRef }
  }
}
