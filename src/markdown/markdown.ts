export default interface IMarkdown {
  heading(text: string): string
  bold(text: string): string
  link(link: string, display: string): string
  ul(list: string[]): string
}
