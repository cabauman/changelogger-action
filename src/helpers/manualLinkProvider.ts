import { posix } from 'path'
import { ILinkProvider, IMarkdown } from '../contracts/interfaces'

export class ManualLinkProvider implements ILinkProvider {
  public constructor(
    private readonly baseUrl: URL,
    private readonly markdown: IMarkdown,
  ) {}

  public getShaLink(sha: string): string {
    const pathname = posix.join(this.baseUrl.pathname, `/commit/${sha}`)
    const url = new URL(pathname, this.baseUrl)
    // TODO: This makes the assumption that the IMarkdown implementation supports
    // the back-tick code block markdown. Both Slack and GitHub do, but might
    // want to eventually move this formatting to the markdown implementation.
    return this.markdown.link('`' + sha + '`', url.toString())
  }
}
