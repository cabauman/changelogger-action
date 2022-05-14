import { IMarkdown } from '../contracts/interfaces'

export default class GitHubMarkdown implements IMarkdown {
  heading(text: string, level: number): string {
    return `${'#'.repeat(level)} ${text}\n\n`
  }

  bold(text: string): string {
    return `**${text}**`
  }

  link(display: string, link: string): string {
    return `[${display}](${link})`
  }

  ul(list: string[]): string {
    return `* ${list.join('\n* ')}\n\n`
  }
}
