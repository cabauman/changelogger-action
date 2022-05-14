import { IMarkdown } from '../contracts/interfaces'

export default class SlackMarkdown implements IMarkdown {
  heading(text: string, level: number): string {
    return this.bold(text) + '\n'
  }

  bold(text: string): string {
    return `*${text}*`
  }

  link(display: string, link: string): string {
    return `<${link}|${display}>`
  }

  ul(list: string[]): string {
    return `• ${list.join('\n• ')}\n\n`
  }
}
