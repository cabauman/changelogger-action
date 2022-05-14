import { Commit } from '../contracts/types'
import { IMarkdown, IOutputProvider } from '../contracts/interfaces'

export default class DecoratedOutputProvider implements IOutputProvider {
  constructor(
    private readonly outputProvider: IOutputProvider,
    private readonly markdownWriter: IMarkdown,
    private readonly preamble: string,
  ) {}

  public async execute(commits: ReadonlyArray<Commit>): Promise<string> {
    let result = this.markdownWriter.heading(this.preamble, 2)
    result += await this.outputProvider.execute(commits)
    return result
  }
}
