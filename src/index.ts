import * as core from '@actions/core'
import * as github from '@actions/github'
import getConventionalOutput from './getConventionalOutput'
import getCommitRefRange from './getCommitRefRange'
import SlackMarkdown from './slackMarkdown'
import { getCommits } from './getCommits'
import { getChangelogConfig } from './getChangelogConfig'

async function run() {
  const isConventional = core.getBooleanInput('is-conventional')
  const maxCommits = core.getInput('max-commits') || '50'

  // eslint-disable-next-line prefer-const
  let { previousState, currentState } = await getCommitRefRange(github.context.ref)
  if (!previousState || !currentState) {
    return
  }
  currentState = github.context.sha
  const commits = await getCommits(previousState, currentState, maxCommits)

  let result = core.getInput('preamble') || ''
  const markdown = new SlackMarkdown()
  if (isConventional) {
    const config = getChangelogConfig()
    result += getConventionalOutput(commits, markdown, config)
  } else {
    const headers = commits.map((x) => x.header)
    result += markdown.ul(headers)
  }

  result = result.trimEnd()
  core.setOutput('commit-list', result)
}

run().catch((error) => core.error(JSON.stringify(error, null, 2)))
