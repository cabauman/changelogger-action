import * as core from '@actions/core'
import { Api } from '@octokit/plugin-rest-endpoint-methods/dist-types/types'
import { ActionContext } from '../contracts/types'

export default class WorkflowShaProvider {
  public constructor(private readonly octokit: Api, private readonly context: ActionContext) {}

  public async execute(branchName: string, workflowId: number): Promise<string | undefined> {
    const response = await this.octokit.rest.actions.listWorkflowRuns({
      owner: this.context.owner,
      repo: this.context.repo,
      workflow_id: workflowId,
      branch: branchName,
      status: 'success',
      per_page: 1,
    })
    const workflowCount = response.data.total_count
    if (workflowCount === 0) {
      core.info(
        `No successful workflows were found for '${branchName}' branch and '${workflowId}' workflow.`,
      )
      return undefined
    }
    return response.data.workflow_runs[0].head_sha
  }
}
