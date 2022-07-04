import { BranchComparisonStrategy, OutputFlavor } from '../config/getInput'

export type Commit = {
  sha: string // %h
  rawBody: string // %B
  header: string // %s
}

export type CommitRefRange = {
  previousRef: string
  currentRef: string
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
  subject: string
  commitUrl: string
}

export type ConventionalCommitInfo = {
  scope: string | undefined
  type: string
  sectionName: string
} & CommitInfo

export type Section = {
  name: string
  commits: ConventionalCommitInfo[]
}

export type ConventionalChangelogEntry = {
  releaseDate: string
  version: string
  previousVersion: string
  sections: ReadonlyArray<Section>
}

export type ChangelogEntry = {
  releaseDate: string
  version: string
  previousVersion: string
  commits: ReadonlyArray<CommitInfo>
}
