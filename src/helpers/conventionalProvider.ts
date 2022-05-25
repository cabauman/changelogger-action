/* eslint-disable @typescript-eslint/no-var-requires */
const spec = require('conventional-changelog-conventionalcommits')
import { sync } from 'conventional-commits-parser'
import * as core from '@actions/core'
import { Commit, Section, ChangelogConfig } from '../contracts/types'

export default class ConventionalProvider {
  public constructor(private readonly changelogConfig: ChangelogConfig) {}

  public async execute(
    commits: ReadonlyArray<Commit>,
  ): Promise<Record<string, Section>> {
    const options = await spec()

    const map: { [key: string]: Section } = {}
    for (const x of this.changelogConfig.types.values()) {
      map[x.type] = { name: x.section, commits: [] }
    }
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
      map[commitType.type].commits.push({ scope, sha, subject })

      const isBreakingChange = parsed.notes.some(
        (x) => x.title === 'BREAKING CHANGE',
      )
      if (isBreakingChange) {
        map['BREAKING'].commits.push({ scope, sha, subject })
      }
    }

    for (const key of Object.keys(map)) {
      if (map[key].commits.length === 0) {
        delete map[key]
      }
    }

    return map
  }
}
