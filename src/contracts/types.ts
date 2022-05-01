export type Commit = {
  // TODO: Is this needed?
  commitHash: string // %H
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
  maxCommits: string
  markdownFlavor: string
  isConventional: boolean
}

export type ActionContext = {
  readonly ref: string
  readonly owner: string
  readonly repo: string
  readonly runId: number
  // GITHUB_HEAD_REF
  readonly prSource?: string
  // GITHUB_BASE_REF
  readonly prTarget?: string
}

export type ActionConfig = {
  input: ActionInput
  context: ActionContext
}

export type CommitType = {
  type: string
  section: string
  hidden: boolean
}

export type ChangelogConfig = {
  types: ReadonlyMap<string, CommitType>
}

export type RawChangelogConfig = {
  types: CommitType[]
}
