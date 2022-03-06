import * as core from '@actions/core'
import WorkflowIdProvider from './workflowIdProvider'
import WorkflowShaProvider from './workflowShaProvider'

export default class CommitHashCalculator {
  public constructor(
    private readonly workflowIdProvider: WorkflowIdProvider,
    private readonly workflowShaProvider: WorkflowShaProvider,
    private readonly commitRefValidator: (commitRef: string) => Promise<void>,
  ) {}

  public async execute(branchName: string): Promise<string | undefined> {
    let result: string | undefined
    const workflowId = await this.workflowIdProvider.execute()

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const workflowSha = await this.workflowShaProvider.execute(branchName, workflowId)
      if (!workflowSha) {
        break
      }
      try {
        // Check if the commit still exists.
        await this.commitRefValidator(workflowSha)
        result = workflowSha
        break
      } catch (e) {
        // A force push must have overwritten this commit.
        core.debug(`commit '${workflowSha}' doesn't exist.`)
      }
    }
    return result
  }
}
