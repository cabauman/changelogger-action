/* eslint-disable @typescript-eslint/no-var-requires */
const spec = require('conventional-changelog-conventionalcommits')
import { sync } from 'conventional-commits-parser'
import * as core from '@actions/core'
import { Commit } from '../contracts/types'
import { IMarkdown } from '../contracts/interfaces'
import { IOutputProvider } from '../contracts/interfaces'
import { ChangelogConfig } from '../contracts/types'

export default class ConventionalOutputProvider implements IOutputProvider {
  public constructor(
    private readonly markdown: IMarkdown,
    private readonly changelogConfig: ChangelogConfig,
  ) {}

  public async execute(commits: ReadonlyArray<Commit>) {
    const options = await spec()

    const map: { [key: string]: string[] } = {}
    map['BREAKING'] = []
    for (const x of this.changelogConfig.types.values()) {
      map[x.type] = []
    }
    for (const commit of commits) {
      // TODO: Consider replacing with user input predicate.
      if (commit.header.startsWith('chore(release):')) {
        continue
      }
      const parsed = sync(commit.rawBody, options.parserOpts)
      const type = parsed.type
      const subject = parsed.subject
      if (!type || !subject) {
        core.debug(`Unable to parse commit: ${commit.header}`)
        continue
      }
      const items = map[type] ?? []
      map[type.toLowerCase()] = items
      const scope = parsed.scope
        ? this.markdown.bold(`${parsed.scope}:`) + ' '
        : ''
      const commitLine = `${commit.sha} ${scope}${subject}`
      items.push(commitLine)

      const isBreakingChange = parsed.notes.some(
        (x) => x.title === 'BREAKING CHANGE',
      )
      if (isBreakingChange) {
        map['BREAKING'].push(commitLine)
      }
    }

    let result = ''
    for (const key in map) {
      if (map[key].length === 0) continue
      const commitType = this.changelogConfig.types.get(key)
      if (!commitType) {
        core.debug(`Unrecognized commit type: ${commitType}. Skipping...`)
        continue
      }
      if (commitType.hidden) {
        continue
      }
      const section = commitType.section
      result += this.markdown.heading(section, 3)
      result += this.markdown.ul(map[key])
    }

    return result
  }
}
