import { ChangelogConfig, CommitType, RawChangelogConfig } from './getConventionalOutput'

// https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-conventionalcommits/writer-opts.js
export function defaultConfig(config: RawChangelogConfig) {
  config = config ?? {}
  config.types = config.types ?? [
    { type: 'feat', section: 'Features' },
    { type: 'fix', section: 'Bug Fixes' },
    { type: 'perf', section: 'Performance Improvements' },
    { type: 'revert', section: 'Reverts' },
    { type: 'docs', section: 'Documentation', hidden: true },
    { type: 'style', section: 'Styles', hidden: true },
    { type: 'chore', section: 'Miscellaneous Chores', hidden: true },
    { type: 'refactor', section: 'Code Refactoring', hidden: true },
    { type: 'test', section: 'Tests', hidden: true },
    { type: 'build', section: 'Build System', hidden: true },
    { type: 'ci', section: 'Continuous Integration', hidden: true },
  ]

  config.types.push({ type: 'BREAKING', section: 'BREAKING CHANGES', hidden: false })
  config.types.push({ type: 'OTHER', section: 'Other', hidden: false })

  const result: [string, CommitType][] = config.types.map((x) => [x.type, x])

  return { types: new Map<string, CommitType>(result) }
}

export function getDefaultConfig(): ChangelogConfig {
  const types: CommitType[] = [
    { type: 'feat', section: 'Features', hidden: false },
    { type: 'fix', section: 'Bug Fixes', hidden: false },
    { type: 'perf', section: 'Performance Improvements', hidden: false },
    { type: 'revert', section: 'Reverts', hidden: false },
    { type: 'docs', section: 'Documentation', hidden: true },
    { type: 'style', section: 'Styles', hidden: true },
    { type: 'chore', section: 'Miscellaneous Chores', hidden: true },
    { type: 'refactor', section: 'Code Refactoring', hidden: true },
    { type: 'test', section: 'Tests', hidden: true },
    { type: 'build', section: 'Build System', hidden: true },
    { type: 'ci', section: 'Continuous Integration', hidden: true },
    { type: 'BREAKING', section: 'BREAKING CHANGES', hidden: false },
    { type: 'OTHER', section: 'Other', hidden: false },
  ]

  const result: [string, CommitType][] = types.map((x) => [x.type, x])

  return { types: new Map<string, CommitType>(result) }
}
