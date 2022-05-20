import { GitHub } from '@actions/github/lib/utils'
import { ActionContext } from '../contracts/types'

export default class WorkflowIdProvider {
  public constructor(
    private readonly octokit: InstanceType<typeof GitHub>,
    private readonly context: ActionContext,
  ) {}

  public async execute(): Promise<number> {
    const { data: currentRun } = await this.octokit.rest.actions.getWorkflowRun(
      {
        owner: this.context.owner,
        repo: this.context.repo,
        run_id: this.context.runId,
      },
    )
    return currentRun.workflow_id
  }
}
