import * as core from '@actions/core'
import { Commit } from './commit'
import executeCliCommand from './executeCliCommand'

export const DELIMITER = '------------------------ >8 ------------------------'

/**
 * Gets a list commits between previousState and currentState
 * @param previousState
 * @param currentState
 * @param maxCommits
 * @returns a list of commits
 */
export async function getCommits(
  previousState: string | undefined,
  currentState: string | undefined,
  maxCommits: string,
): Promise<ReadonlyArray<Commit>> {
  // TODO: Get the total count of commits so we can inform the user how many
  // are being excluded from output due to maxCommits.
  // const commitCount = await executeCliCommand(
  //   `git rev-list ${previousState}..${currentState} --count`,
  // )
  core.info(
    `git log ${previousState}..${currentState} --format=%H'|'%B'${DELIMITER}' --max-count=${maxCommits}`,
  )
  const rawCommits = await executeCliCommand(
    `git log ${previousState}..${currentState} --format=%H'|'%B'${DELIMITER}' --max-count=${maxCommits}`,
  )
  const commitInfo = rawCommits.split(DELIMITER + '\n').filter((x) => x != '')
  const commits: Commit[] = commitInfo.map((x) => {
    const components = x.split('|', 2)
    const commitHash = components[0]
    const rawBody = components[1]
    const header = rawBody.split('\n', 1)[0]
    return { commitHash, rawBody, header }
  })
  return commits
}
