import { readFileSync, existsSync } from 'fs'
import { ChangelogConfig, RawChangelogConfig } from '../contracts/types'
import { getDefaultConfig } from './defaultConfig'

// TODO: Consider loading all the different versionrc file types.
// https://github.com/conventional-changelog/standard-version/blob/master/lib/configuration.js
export function getChangelogConfig(): ChangelogConfig {
  const configPath = './.versionrc'
  let userConfig: RawChangelogConfig | undefined
  if (existsSync(configPath)) {
    const configJson = readFileSync(configPath, 'utf8')
    userConfig = JSON.parse(configJson)
  }
  const config = getDefaultConfig(userConfig)
  return config
}
