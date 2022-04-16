import IMarkdown from './markdown'

export default class SlackMarkdown implements IMarkdown {
  heading(text: string): string {
    return this.bold(text) + '\n'
  }

  bold(text: string): string {
    return `*${text}*`
  }

  link(link: string, display: string): string {
    return `<${link}|${display}>`
  }

  ul(list: string[]): string {
    return `• ${list.join('\n• ')}\n\n`
  }
}
