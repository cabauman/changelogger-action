import { Commit } from '../commit'
import { IActionInput, IMarkdown } from './interfaces'

export default class CommitsToMarkdownTranformer {
  constructor(private readonly input: IActionInput, private readonly markdown: IMarkdown) {}

  public async execute(commits: ReadonlyArray<Commit>): Promise<string> {
    let result = this.input.preamble
    const headers = commits.map((x) => x.header)
    result += this.markdown.ul(headers)
    return result
  }
}
