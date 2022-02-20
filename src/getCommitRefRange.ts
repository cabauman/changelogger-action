import * as core from '@actions/core'
import executeCliCommand from './executeCliCommand'
import { getCommitHashOfLastSuccessfulWorkflowByCurrentBranch } from './getCommitHashOfLastSuccessfulWorkflowByCurrentBranch'

/**
 * Gets a commit range that can be used with a git log command (e.g. git log from..to).
 * @param githubRef
 * @returns references to the current commit and the last commit of the same branch or last tag
 */
export default async function getCommitRefRange(githubRef: string) {
  let currentState: string | undefined
  let previousState: string | undefined

  // TODO: Make githubRef a value type.
  if (githubRef.startsWith('refs/heads/')) {
    const branchName = githubRef.slice('refs/heads/'.length)
    currentState = branchName
    // TODO: Inject this.
    const previousState = await getCommitHashOfLastSuccessfulWorkflowByCurrentBranch(branchName)
    if (previousState == null) {
      // TODO: Include workflow name in message.
      core.warning(`Failed to find a previous successful pipeline for ${branchName} branch.`)
    }
  } else if (githubRef.startsWith('refs/tags/')) {
    const tagName = githubRef.slice('refs/tags/'.length)
    currentState = tagName
    core.info(`git describe --tags --abbrev=0 --always ${tagName}`)
    previousState = (
      await executeCliCommand(`git describe --tags --abbrev=0 --always ${tagName}`)
    ).trim()
  } else {
    // TODO: Should we just log a warning (and set the preamble as output) instead of fail?
    core.setFailed(
      `Expected github.context.ref to start with refs/heads/ or refs/tags/ but instead was ${githubRef}`,
    )
  }

  return { currentState, previousState }
}
