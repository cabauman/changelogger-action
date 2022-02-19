import * as core from '@actions/core'
import executeCliCommand from './executeCliCommand'
import { getCommitHashOfLastWorkflowByCurrentBranch } from './getCommitHashOfLastWorkflowByCurrentBranch'

export default async function getCommitsDiff(githubRef: string) {
  let currentState: string | undefined
  let previousState: string | undefined

  if (githubRef.startsWith('refs/heads/')) {
    const branchName = githubRef.slice('refs/heads/'.length)
    currentState = branchName
    const commitHashOfLastWorkflowByCurrentBranch =
      await getCommitHashOfLastWorkflowByCurrentBranch(branchName)
    if (commitHashOfLastWorkflowByCurrentBranch == null) {
      core.warning(`Failed to find a previous pipeline for ${branchName} branch.`)
    }
    previousState = commitHashOfLastWorkflowByCurrentBranch
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
