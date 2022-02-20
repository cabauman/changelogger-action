import * as core from '@actions/core'
import * as github from '@actions/github'
import executeCliCommand from './executeCliCommand'

/**
 * Only checks workflows matching the currently executing workflow.
 * @param branchName
 * @returns the commit hash of the last successful workflow by the current branch,
 * or undefined if no successful workflows were found; also returns undefined if
 * the commit of a successful workflow no longer exists (e.g. due to a force push)
 */
export async function getCommitHashOfLastSuccessfulWorkflowByCurrentBranch(branchName: string) {
  const token = core.getInput('token')
  const octokit = github.getOctokit(token)

  let result: string | undefined

  const { data: currentRun } = await octokit.rest.actions.getWorkflowRun({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    run_id: Number(github.context.runId),
  })
  //workflow_ids.push(String(current_run.workflow_id))
  //const workflowId = String(currentRun.workflow_id)

  let page: number | undefined
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const response = await octokit.rest.actions.listWorkflowRuns({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      // TODO: Provide this filename as a parameter.
      workflow_id: currentRun.workflow_id,
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
