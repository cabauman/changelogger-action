import * as core from '@actions/core'
import * as github from '@actions/github'
import executeCliCommand from './executeCliCommand'

export async function getCommitHashOfLastWorkflowByCurrentBranch(branchName: string) {
  const token = core.getInput('token')
  const octokit = github.getOctokit(token)

  let result: string | undefined

  let page: number | undefined
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const response = await octokit.rest.actions.listWorkflowRuns({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      workflow_id: 'test.yml',
      branch: branchName,
      status: 'success',
      per_page: 1,
      page: page,
    })
    const workflowCount = response.data.total_count
    if (workflowCount === 0) {
      core.info(
        `No successful workflows were found for [${branchName}] branch and [${github.context.workflow}] workflow.`,
      )
      break
    }
    const workflowRun = response.data.workflow_runs[0]
    try {
      // Check if the commit still exists.
      executeCliCommand(`git cat-file -t ${workflowRun.head_sha}`)
      result = workflowRun.head_sha
      break
    } catch (e) {
      // A force push must have overwritten this commit.
      core.debug(`commit [${workflowRun.head_sha}] doesn't exist.`)
    }
  }

  return result
}
