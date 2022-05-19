import CommitListCalculator from './mainDependencies/commitListCalculator'
import CommitRefRangeCalculator from './mainDependencies/commitRefRangeCalculator'
import { IOutputProvider, IResultSetter } from './contracts/interfaces'

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
        // TODO: Consider setting the preamble as the output.
        this.resultSetter.setOutput('commit-list', 'No previous commits to compare to.')
        return
      }
      const commits = await this.commitListCalculator.execute(commitRefRange)
      const markdown = await this.outputProvider.execute(commits)
      this.resultSetter.setOutput('commit-list', markdown)
    } catch (error) {
      // TODO: Consider using error util. JSON.stringify doesn't do well with errors.
      const message = error instanceof Error ? error.message : JSON.stringify(error)
      this.resultSetter.setFailed(message)
    }
  }
}
