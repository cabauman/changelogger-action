/* eslint-disable @typescript-eslint/no-var-requires */
const spec = require('conventional-changelog-conventionalcommits')
import * as core from '@actions/core'
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
  core.info(`[getConventionalOutput] commits: ${commits.length}`)
  for (const commit of commits) {
    core.info(`[getConventionalOutput] commit: ${JSON.stringify(commit)}`)
    const parsed = sync(commit.rawBody, options.parserOpts)
    core.info(`[getConventionalOutput] parsed: ${JSON.stringify(parsed)}`)
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

  core.info(`[getConventionalOutput] map: ${JSON.stringify(map)}`)

  let result = ''
  for (const key in map) {
    if (map[key].length === 0) continue
    const commitType = changelogConfig.types.get(key)
    if (!commitType || commitType.hidden) continue
    const section = commitType.section
    result += markdown.heading(section)
    result += markdown.ul(map[key])
  }

  core.info(`[getConventionalOutput] result: ${result}`)
  return result
}
