// TODO: Move to interfaces file, and rename to ICommit?
export interface Commit {
  // TODO: Is this needed?
  commitHash: string // %H
  rawBody: string // %B
  header: string // %s
}
