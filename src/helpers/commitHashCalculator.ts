import WorkflowIdProvider from './workflowIdProvider'
import WorkflowShaProvider from './workflowShaProvider'

export default class CommitHashCalculator {
  public constructor(
    private readonly workflowIdProvider: WorkflowIdProvider,
    private readonly workflowShaProvider: WorkflowShaProvider,
  ) {}

  public async execute(branchName: string): Promise<string | undefined> {
    const workflowId = await this.workflowIdProvider.execute()
    const workflowSha = await this.workflowShaProvider.execute(branchName, workflowId)
    return workflowSha
  }
}
