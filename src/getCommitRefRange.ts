import * as core from '@actions/core'
import * as github from '@actions/github'
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

  // TODO: Consider just setting currentState as github.context.sha.

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
    // TODO: Handle case when --always takes affect (returns a sha instead of tag).
    previousState = 'origin/' + previousState
  } else if (githubRef.startsWith('refs/pull/')) {
    // const pr = github.context.payload.pull_request!
    // const { data: prCommits } = await github.getOctokit('').rest.pulls.listCommits({
    //   owner: pr.base.repo.owner.login,
    //   repo: pr.base.repo.name,
    //   pull_number: pr.number,
    // })
    // const commitSha = prCommits[0].sha
    // const eventName = github.context.eventName // pull_request
    //const githubRefName = process.env.GITHUB_REF_NAME
    previousState = process.env.GITHUB_BASE_REF // pr target
    currentState = process.env.GITHUB_HEAD_REF // pr source
    previousState = 'origin/' + previousState
  } else {
    // TODO: Should we just log a warning (and set the preamble as output) instead of fail?
    core.setFailed(
      `Expected github.context.ref to start with refs/heads/ or refs/tags/ but instead was ${githubRef}`,
    )
    // refs/pull/1/merge
  }

  return { currentState, previousState }
}
