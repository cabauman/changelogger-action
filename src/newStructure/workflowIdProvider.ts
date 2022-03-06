import { Api } from '@octokit/plugin-rest-endpoint-methods/dist-types/types'
import { IActionContext } from './interfaces'

export default class WorkflowIdProvider {
  public constructor(private readonly octokit: Api, private readonly context: IActionContext) {}

  public async execute(): Promise<number> {
    const { data: currentRun } = await this.octokit.rest.actions.getWorkflowRun({
      owner: this.context.owner,
      repo: this.context.repo,
      run_id: this.context.runId,
    })
    return currentRun.workflow_id
  }
}
