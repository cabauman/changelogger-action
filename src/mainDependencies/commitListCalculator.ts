import { Commit } from '../contracts/types'
import { CommitRefRange } from '../contracts/types'

export const DELIMITER = '------------------------'

// TODO: Consider renaming this to GitCommitListProvider that implements
// an ICommitListProvider. Because we may decide in the future to use
// the GitHub API instead of git (GitHubApiCommitListProvider).
export default class CommitListCalculator {
  constructor(
    private readonly commitProvider: (
      commitRefRange: CommitRefRange,
      delimeter: string,
    ) => Promise<string>,
  ) {}

  public async execute(
    commitRefRange: CommitRefRange,
  ): Promise<readonly Commit[]> {
    const rawCommits = await this.commitProvider(commitRefRange, DELIMITER)
    const commitInfo = rawCommits
      .split(`\n${DELIMITER}\n`)
      .filter((x) => x != '')
    const commits: Commit[] = commitInfo.map((x) => {
      const components = x.split('|', 2)
      const sha = components[0]
      const rawBody = components[1]
      const header = rawBody.split('\n', 1)[0]
      return { sha, rawBody, header }
    })
    return commits
  }
}
