import { BranchComparisonStrategy, OutputFlavor } from '../config/getInput'

export type Commit = {
  sha: string // %h
  rawBody: string // %B
  header: string // %s
}

export type CommitRefRange = {
  previousRef: string | undefined
  currentRef: string | undefined
}

export type ActionInput = {
  token: string
  preamble: string
  outputFlavor: OutputFlavor
  isConventional: boolean
  branchComparisonStrategy: BranchComparisonStrategy
}

export type ActionContext = {
  readonly ref: string
  readonly owner: string
  readonly repo: string
  readonly runId: number
}

export type ActionConfig = {
  input: ActionInput
  context: ActionContext
}

export type CommitType = {
  type: string
  section: string
  hidden?: boolean
}

export type ChangelogConfig = {
  types: ReadonlyMap<string, CommitType>
}

export type RawChangelogConfig = {
  types: CommitType[]
}

export type CommitInfo = {
  sha: string
  scope: string | undefined
  subject: string
}

export type Section = {
  name: string
  commits: CommitInfo[]
}
