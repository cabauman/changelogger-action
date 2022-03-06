import CommitListCalculator from './commitListCalculator'
import CommitRefRangeCalculator from './commitRefRangeCalculator'
import { IOutputProvider, IResultSetter } from './interfaces'

export default class GitHubAction {
  constructor(
    private readonly commitRefRangeCalculator: CommitRefRangeCalculator,
    private readonly commitListCalculator: CommitListCalculator,
    private readonly commitsToMarkdownTranformer: IOutputProvider,
    private readonly resultSetter: IResultSetter,
  ) {}

  public async run(): Promise<void> {
    try {
      console.log('running action...')
      const commitRefRange = await this.commitRefRangeCalculator.execute()
      const commits = await this.commitListCalculator.execute(commitRefRange) // commitListCreator
      const markdown = await this.commitsToMarkdownTranformer.execute(commits) // markdownCreator
      this.resultSetter.setOutput('commit-list', markdown)
    } catch (error) {
      const message = error instanceof Error ? error.message : JSON.stringify(error)
      console.log(message)
      this.resultSetter.setFailed(message)
    }
  }
}
