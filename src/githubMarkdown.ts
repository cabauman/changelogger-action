import IMarkdown from './markdown'

export default class GitHubMarkdown implements IMarkdown {
  heading(text: string): string {
    return `### ${text}\n\n`
  }

  bold(text: string): string {
    return `**${text}**`
  }

  link(link: string, display: string): string {
    return `[${display}](${link})`
  }

  ul(list: string[]): string {
    return `* ${list.join('\n* ')}\n\n`
  }
}
