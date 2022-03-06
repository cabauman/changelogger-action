/* eslint-disable @typescript-eslint/no-var-requires */
const spec = require('conventional-changelog-conventionalcommits')
import * as core from '@actions/core'
import { sync } from 'conventional-commits-parser'
import { Commit } from '../commit'
import { ChangelogConfig } from '../getConventionalOutput'
import IMarkdown from '../markdown'

export default class ConventionalOutputProvider {
  public constructor(
    private readonly markdown: IMarkdown,
    private readonly changelogConfig: ChangelogConfig,
  ) {}

  public async execute(commits: ReadonlyArray<Commit>) {
    const options = await spec()

    const map: { [key: string]: string[] } = {}
    map['BREAKING'] = []
    core.debug(`[getConventionalOutput] commits: ${commits.length}`)
    for (const commit of commits) {
      core.debug(`[getConventionalOutput] commit: ${JSON.stringify(commit)}`)
      const parsed = sync(commit.rawBody, options.parserOpts)
      core.debug(`[getConventionalOutput] parsed: ${JSON.stringify(parsed)}`)
      const type = parsed.type ?? 'OTHER'
      const subject = parsed.subject ?? commit.header
      const items = map[type] ?? []
      map[type] = items
      const prefix = parsed.scope ? this.markdown.bold(`${parsed.scope}: `) : ''
      items.push(prefix + subject)

      const breakingChanges = parsed.notes.filter((x) => x.title === 'BREAKING CHANGE')
      if (breakingChanges.length === 0) continue
      map['BREAKING'].push(...breakingChanges.map((x) => x.text))
    }

    core.debug(`[getConventionalOutput] map: ${JSON.stringify(map)}`)

    let result = ''
    for (const key in map) {
      if (map[key].length === 0) continue
      const commitType = this.changelogConfig.types.get(key)
      if (!commitType || commitType.hidden) continue
      const section = commitType.section
      result += this.markdown.heading(section)
      result += this.markdown.ul(map[key])
    }

    core.debug(`[getConventionalOutput] result: ${result}`)
    return result
  }
}
