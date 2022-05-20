import CommitListCalculator from './mainDependencies/commitListCalculator'
import CommitRefRangeCalculator from './mainDependencies/commitRefRangeCalculator'
import { IOutputProvider, IResultSetter } from './contracts/interfaces'
import { error2Json } from './utils/errorUtil'

export default class GitHubAction {
  constructor(
    private readonly commitRefRangeCalculator: CommitRefRangeCalculator,
    private readonly commitListCalculator: CommitListCalculator,
    private readonly outputProvider: IOutputProvider,
    private readonly resultSetter: IResultSetter,
  ) {}

  public async run(): Promise<void> {
    try {
      const commitRefRange = await this.commitRefRangeCalculator.execute()
      if (commitRefRange.previousRef == null) {
        this.resultSetter.setOutput(
          'changelog',
          'No previous commits to compare to.',
        )
        return
      }
      const commits = await this.commitListCalculator.execute(commitRefRange)
      const markdown = await this.outputProvider.execute(commits)
      this.resultSetter.setOutput('changelog', markdown)
    } catch (error) {
      this.resultSetter.setFailed(error2Json(error))
    }
  }
}
