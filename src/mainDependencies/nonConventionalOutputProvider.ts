import { Commit } from '../contracts/types'
import { IMarkdown, IOutputProvider } from '../contracts/interfaces'

export default class NonConventionalOutputProvider implements IOutputProvider {
  constructor(private readonly markdown: IMarkdown) {}

  public async execute(commits: ReadonlyArray<Commit>): Promise<string> {
    const headers = commits.map((x) => x.header)
    const result = this.markdown.ul(headers)
    return result
  }
}
