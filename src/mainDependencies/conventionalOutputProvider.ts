import { Commit } from '../contracts/types'
import { ILinkProvider, IMarkdown } from '../contracts/interfaces'
import ConventionalProvider from '../helpers/conventionalProvider'

export default class ConventionalOutputProvider {
  public constructor(
    private readonly conventionalProvider: ConventionalProvider,
    private readonly markdown: IMarkdown,
    private readonly linkProvider: ILinkProvider,
  ) {}

  public async execute(commits: ReadonlyArray<Commit>) {
    const sections = await this.conventionalProvider.execute(commits)

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
