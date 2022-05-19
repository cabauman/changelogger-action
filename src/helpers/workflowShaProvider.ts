import * as core from '@actions/core'
import { Api } from '@octokit/plugin-rest-endpoint-methods/dist-types/types'
import { ActionContext } from '../contracts/types'

export default class WorkflowShaProvider {
  public constructor(
    private readonly octokit: Api,
    private readonly context: ActionContext,
    private readonly commitRefValidator: (commitRef: string) => Promise<void>,
  ) {}

  public async execute(branchName: string, workflowId: number): Promise<string | undefined> {
    let page = 1
    let workflowSha: string | undefined
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const response = await this.octokit.rest.actions.listWorkflowRuns({
        owner: this.context.owner,
        repo: this.context.repo,
        workflow_id: workflowId,
        branch: branchName,
        status: 'success',
        per_page: 1,
        page,
      })
      const workflowCount = response.data.total_count
      if (workflowCount === 0) {
        core.info(
          `No successful workflows were found for '${branchName}' branch and '${workflowId}' workflow.`,
        )
        return undefined
      }
      workflowSha = response.data.workflow_runs[0].head_sha
      try {
        // Check if the commit still exists.
        await this.commitRefValidator(workflowSha)
        break
      } catch (error) {
        // A force push must have overwritten this commit.
        core.debug(`commit '${workflowSha}' doesn't exist.`)
        page += 1
      }
    }
    return workflowSha
  }
}
