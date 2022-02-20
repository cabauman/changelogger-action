/* eslint-disable @typescript-eslint/no-var-requires */
const spec = require('conventional-changelog-conventionalcommits')
import { sync } from 'conventional-commits-parser'
import { Commit } from './commit'
import IMarkdown from './markdown'

export interface CommitType {
  type: string
  section: string
  hidden: boolean
}

export interface ChangelogConfig {
  types: ReadonlyMap<string, CommitType>
}

export default async function getConventionalOutput(
  commits: ReadonlyArray<Commit>,
  markdown: IMarkdown,
  changelogConfig: ChangelogConfig,
) {
  const options = await spec()

  const map: { [key: string]: string[] } = {}
  map['BREAKING'] = []
  for (const commit of commits) {
    const parsed = sync(commit.rawBody, options.parserOpts)
    const type = parsed.type ?? 'OTHER'
    const subject = parsed.subject ?? commit.header
    const items = map[type] ?? []
    map[type] = items
    const prefix = parsed.scope ? markdown.bold(`${parsed.scope}: `) : ''
    items.push(prefix + subject)

    const breakingChanges = parsed.notes.filter((x) => x.title === 'BREAKING CHANGE')
    if (breakingChanges.length === 0) continue
    map['BREAKING'].push(...breakingChanges.map((x) => x.text))
  }

  let result = ''
  for (const key in map) {
    if (map[key].length === 0) continue
    const commitType = changelogConfig.types.get(key)
    if (!commitType || commitType.hidden) continue
    const section = commitType.section
    result += markdown.heading(section)
    result += markdown.ul(map[key])
  }

  return result
}
