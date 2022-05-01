import { Commit } from '../contracts/types'
import { IMarkdown, IOutputProvider } from '../contracts/interfaces'
import { ActionInput } from '../contracts/types'

export default class CommitsToMarkdownTranformer implements IOutputProvider {
  constructor(private readonly input: ActionInput, private readonly markdown: IMarkdown) {}

  public async execute(commits: ReadonlyArray<Commit>): Promise<string> {
    let result = this.input.preamble
    const headers = commits.map((x) => x.header)
    result += this.markdown.ul(headers)
    return result
  }
}
