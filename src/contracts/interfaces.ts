import { Commit } from '../contracts/types'

export interface IResultSetter {
  setFailed(message: string): void
  setOutput(name: string, value: string): void
}

export interface ILogger {
  info(message: string): void
  error(message: string | Error): void
}

export interface IMarkdown {
  heading(text: string, level: number): string
  bold(text: string): string
  link(display: string, link: string): string
  ul(list: string[]): string
}

export interface IInputRetriever {
  getInput(name: string): string
  getBooleanInput(name: string): boolean
}

export interface IOutputProvider {
  execute(commits: ReadonlyArray<Commit>): Promise<string>
}
