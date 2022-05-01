import * as exec from '@actions/exec'
import { Commit } from '../contracts/types'
import { CommitRefRange } from '../contracts/types'

export const DELIMITER = '------------------------'

export default class CommitListCalculator {
  constructor(
    private readonly commitProvider: (
      commitRefRange: CommitRefRange,
      delimeter: string,
    ) => Promise<string>,
  ) {}
  public async execute(commitRefRange: CommitRefRange): Promise<readonly Commit[]> {
    // TODO: Get the total count of commits so we can inform the user how many
    // are being excluded from output due to maxCommits.
    // const commitCount = await executeCliCommand(
    //   `git rev-list ${previousState}..${currentState} --count`,
    // )

    const rawCommits = await this.commitProvider(commitRefRange, DELIMITER)
    const commitInfo = rawCommits.split(`\n${DELIMITER}\n`).filter((x) => x != '')
    const commits: Commit[] = commitInfo.map((x) => {
      const components = x.split('|', 2)
      const commitHash = components[0]
      const rawBody = components[1]
      const header = rawBody.split('\n', 1)[0]
      return { commitHash, rawBody, header }
    })
    return commits
  }
}
