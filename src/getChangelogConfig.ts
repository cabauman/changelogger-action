import { readFileSync } from 'fs'
import { defaultConfig } from './defaultConfig'

// https://github.com/conventional-changelog/standard-version/blob/master/lib/configuration.js
export function getChangelogConfig() {
  const configPath = './.versionrc'
  const configJson = readFileSync(configPath, 'utf8')
  let config = JSON.parse(configJson)
  config = defaultConfig(config)
  return config
}
