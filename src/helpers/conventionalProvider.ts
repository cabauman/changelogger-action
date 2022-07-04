/* eslint-disable @typescript-eslint/no-var-requires */
const spec = require('conventional-changelog-conventionalcommits')
import { sync } from 'conventional-commits-parser'
import * as core from '@actions/core'
import {
  Commit,
  Section,
  ChangelogConfig,
  ConventionalCommitInfo,
} from '../contracts/types'
import { ILinkProvider } from '../contracts/interfaces'

export default class ConventionalProvider {
  public constructor(
    private readonly changelogConfig: ChangelogConfig,
    private readonly linkProvider: ILinkProvider,
  ) {}

  public async execute(
    commits: ReadonlyArray<Commit>,
  ): Promise<readonly ConventionalCommitInfo[]> {
    const options = await spec()

    const commitInfos: ConventionalCommitInfo[] = []
    for (const commit of commits) {
      // TODO: Consider replacing with user input predicate.
      if (commit.header.startsWith('chore(release):')) {
        continue
      }
      const parsed = sync(commit.rawBody, options.parserOpts)
      const sha = commit.sha
      const type = parsed.type?.toLowerCase()
      const subject = parsed.subject
      if (!type || !subject) {
        core.debug(`Unable to parse commit: ${commit.header}`)
        continue
      }

      const commitType = this.changelogConfig.types.get(type)
      if (!commitType) {
        core.warning(`Unrecognized commit type: ${commitType}. Skipping...`)
        continue
      }
      if (commitType.hidden) {
        continue
      }

      const scope = parsed.scope ?? undefined
      const sectionName = commitType.section
      const commitUrl = this.linkProvider.getShaLink(commit.sha)
      const commitInfo: ConventionalCommitInfo = {
        scope,
        sha,
        subject,
        type,
        sectionName,
        commitUrl,
      }
      commitInfos.push(commitInfo)

      const isBreakingChange = parsed.notes.some(
        (x) => x.title === 'BREAKING CHANGE',
      )
      if (isBreakingChange) {
        commitInfos.push({ ...commitInfo, type: 'BREAKING' })
      }
    }

    return commitInfos
  }
}
