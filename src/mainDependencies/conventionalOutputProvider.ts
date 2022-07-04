import { Commit, ConventionalCommitInfo } from '../contracts/types'
import {
  ILinkProvider,
  IMarkdown,
  IOutputProvider,
} from '../contracts/interfaces'
import ConventionalProvider from '../helpers/conventionalProvider'

export default class ConventionalOutputProvider implements IOutputProvider {
  public constructor(
    private readonly conventionalProvider: ConventionalProvider,
    private readonly markdown: IMarkdown,
    private readonly linkProvider: ILinkProvider,
  ) {}

  public async execute(tag: string, commits: ReadonlyArray<Commit>) {
    //const sections = await this.conventionalProvider.execute(commits)
    const processedCommits = await this.conventionalProvider.execute(commits)
    const output = new ConventionalOutputProvider2().execute(
      tag,
      processedCommits,
    )

    let result = ''
    for (const section of Object.values(sections)) {
      if (section.commits.length === 0) continue
      result += this.markdown.heading(section.name, 3)

      const formattedCommits: string[] = []
      for (const commit of section.commits) {
        const scope = commit.scope
          ? this.markdown.bold(`${commit.scope}:`) + ' '
          : ''
        const shaLink = this.linkProvider.getShaLink(commit.sha)
        const formattedCommit = `${shaLink} ${scope}${commit.subject}`
        formattedCommits.push(formattedCommit)
      }

      result += this.markdown.ul(formattedCommits)
    }

    return result
  }
}

export class ConventionalOutputProvider2 {
  // public constructor(
  //   private readonly conventionalProvider: ConventionalProvider,
  //   private readonly markdown: IMarkdown,
  //   private readonly linkProvider: ILinkProvider,
  // ) {}

  public async execute(
    tag: string,
    commits: ReadonlyArray<ConventionalCommitInfo>,
  ) {
    let result = ''
    for (const section of Object.values(sections)) {
      if (section.commits.length === 0) continue
      result += this.markdown.heading(section.name, 3)

      const formattedCommits: string[] = []
      for (const commit of section.commits) {
        const scope = commit.scope
          ? this.markdown.bold(`${commit.scope}:`) + ' '
          : ''
        const shaLink = this.linkProvider.getShaLink(commit.sha)
        const formattedCommit = `${shaLink} ${scope}${commit.subject}`
        formattedCommits.push(formattedCommit)
      }

      result += this.markdown.ul(formattedCommits)
    }

    return result
  }
}
