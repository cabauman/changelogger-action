import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { Commit } from './commit'
import executeCliCommand from './executeCliCommand'

export const DELIMITER = '------------------------------------------------'

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
  core.info(`git fetch origin`)
  // try {
  //   await executeCliCommand(`git fetch origin`)
  // } catch (error) {
  //   core.error(JSON.stringify(error, null, 2))
  // }
  const fetchResult = await exec.exec('git fetch origin')
  core.info(`fetchResult: ${fetchResult}`)
  core.info(`git reset --hard origin/feat/conventional-commits`)
  try {
    await exec.exec(`git reset --hard origin/feat/conventional-commits`)
  } catch (error) {
    core.error(JSON.stringify(error, null, 2))
  }
  core.info(
    `git log ${previousState}..${currentState} --format=%H'|'%B'${DELIMITER}' --max-count=${maxCommits}`,
  )
  const result = await exec.getExecOutput(
    `git log ${previousState}..HEAD --format=%H'|'%B'${DELIMITER}' --max-count=${maxCommits}`,
  )
  core.info(`stderr: ${result.stderr}`)
  const rawCommits = result.stdout
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
