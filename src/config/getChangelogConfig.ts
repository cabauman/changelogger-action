import { readFileSync } from 'fs'
import { defaultConfig } from './defaultConfig'

// TODO: Consider loading all the different versionrc file types.
// https://github.com/conventional-changelog/standard-version/blob/master/lib/configuration.js
export function getChangelogConfig() {
  const configPath = './.versionrc'
  const configJson = readFileSync(configPath, 'utf8')
  let config = JSON.parse(configJson)
  config = defaultConfig(config)
  return config
}
