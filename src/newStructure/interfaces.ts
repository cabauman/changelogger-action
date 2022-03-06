import { Commit } from '../commit'

export interface CommitRefRange {
  previousRef: string | undefined
  currentRef: string | undefined
}

export type IResultSetter = {
  setFailed(message: string): void
  setOutput(name: string, value: string): void
}

export type ILogger = {
  info(message: string): void
  error(message: string | Error): void
}

export interface IMarkdown {
  heading(text: string): string
  bold(text: string): string
  link(link: string, display: string): string
  ul(list: string[]): string
}

export interface IInputRetriever {
  getInput(name: string): string
  getBooleanInput(name: string): boolean
}

export interface IOutputProvider {
  execute(commits: ReadonlyArray<Commit>): Promise<string>
}

export interface IActionInput {
  token: string
  preamble: string
  maxCommits: string
  markdownFlavor: string
  isConventional: boolean
}

export interface IActionContext {
  readonly ref: string
  readonly owner: string
  readonly repo: string
  readonly runId: number
  // GITHUB_HEAD_REF
  readonly prSource?: string
  // GITHUB_BASE_REF
  readonly prTarget?: string
}

export interface IActionConfig {
  input: IActionInput
  context: IActionContext
}
