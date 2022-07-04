import { Commit, CommitInfo } from '../contracts/types'
import { IMarkdown, IOutputProvider } from '../contracts/interfaces'

export default class NonConventionalOutputProvider implements IOutputProvider {
  constructor(private readonly markdown: IMarkdown) {}

  public async execute(commits: ReadonlyArray<Commit>): Promise<string> {
    const headers = commits.map((x) => x.header)
    const result = this.markdown.ul(headers)
    return result
  }
}

export class NonConventionalOutputProvider2 {
  public execute(commits: ReadonlyArray<Commit>): ReadonlyArray<CommitInfo> {
    return commits.map((x) => {
      return { sha: x.sha, subject: x.header, commitUrl: '' }
    })
  }
}

export class NonConventionalOutputProvider3 {
  constructor(private readonly markdown: IMarkdown) {}

  public async execute(commits: ReadonlyArray<CommitInfo>): Promise<string> {
    const headers = commits.map((x) => x.subject)
    const result = this.markdown.ul(headers)
    return result
  }
}
