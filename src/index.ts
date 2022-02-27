import * as core from '@actions/core'
import * as github from '@actions/github'
import getConventionalOutput from './getConventionalOutput'
import getCommitRefRange from './getCommitRefRange'
import SlackMarkdown from './slackMarkdown'
import { getCommits } from './getCommits'
import { getChangelogConfig } from './getChangelogConfig'
import GitHubMarkdown from './githubMarkdown'

async function run() {
  const isConventional = core.getBooleanInput('is-conventional')
  const maxCommits = core.getInput('max-commits') || '50'

  const { previousState, currentState } = await getCommitRefRange(github.context.ref)
  if (!previousState || !currentState) {
    return
  }
  const commits = await getCommits(previousState, currentState, maxCommits)

  let result = core.getInput('preamble') || ''
  result += result !== '' ? '\n' : ''
  const markdownFlavor = core.getInput('markdown-flavor')
  if (markdownFlavor !== 'slack' && markdownFlavor !== 'github') {
    core.setFailed(
      `Invalid input for markdown-flavor. Only 'github' and 'slack' are supported, ` +
        `but received ${markdownFlavor}`,
    )
  }
  const markdown = markdownFlavor === 'github' ? new GitHubMarkdown() : new SlackMarkdown()
  if (isConventional) {
    const config = getChangelogConfig()
    result += await getConventionalOutput(commits, markdown, config)
  } else {
    const headers = commits.map((x) => x.header)
    result += markdown.ul(headers)
  }

  result = result.trimEnd()
  core.setOutput('commit-list', result)
}

run().catch((error) => core.setFailed(JSON.stringify(error, null, 2)))
