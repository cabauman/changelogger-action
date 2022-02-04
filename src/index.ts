import * as core from '@actions/core'
import * as github from '@actions/github'
import executeCliCommand from './executeCliCommand'
import { getCommitHashOfLastWorkflowByCurrentBranch } from './getCommitHashOfLastWorkflowByCurrentBranch'

async function run() {
  const maxCommits = core.getInput('max-commits') || '50'

  let currentState: string | undefined
  let previousState: string | undefined

  const githubRef = github.context.ref
  if (githubRef.startsWith('refs/heads/')) {
    const branchName = githubRef.slice('refs/heads/'.length)
    currentState = branchName
    const commitHashOfLastWorkflowByCurrentBranch =
      await getCommitHashOfLastWorkflowByCurrentBranch(branchName)
    if (commitHashOfLastWorkflowByCurrentBranch == null) {
      core.warning(`Failed to find a previous pipeline for ${branchName} branch.`)
      const message = core.getInput('preamble') || ''
      core.setOutput('commit-list', message)
      return
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
      `Expected github.context.ref to start with refs/heads/ or refs/tags/ but instead was ${github.context.ref}`,
    )
    return
  }

  core.info(
    `git log ${previousState}..${currentState} --oneline --reverse --max-count=${maxCommits}`,
  )
  const rawCommits = await executeCliCommand(
    `git log ${previousState}..${currentState} --oneline --reverse --max-count=${maxCommits}`,
  )
  let result = core.getInput('preamble') || ''
  const commits = rawCommits.split('\n').filter((x) => x != '')
  for (const commit of commits) {
    const header = commit.split(' ', 1)[1]
    result += `  • ${header}\n`
  }

  result = result.trimEnd()
  core.setOutput('commit-list', result)
}

run()
