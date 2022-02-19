import * as core from '@actions/core'
import * as github from '@actions/github'
import executeCliCommand from './executeCliCommand'
import getCommitsDiff from './getCommitsDiff'

async function run() {
  const maxCommits = core.getInput('max-commits') || '50'

  const { currentState, previousState } = await getCommitsDiff(github.context.ref)

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
