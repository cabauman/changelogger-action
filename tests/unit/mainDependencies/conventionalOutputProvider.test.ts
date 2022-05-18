import { expect } from 'chai'
import * as tsSinon from 'ts-sinon'
import { Commit } from '../../../src/contracts/types'
import { getDefaultConfig } from '../../../src/config/defaultConfig'
import ConventionalOutputProvider from '../../../src/mainDependencies/conventionalOutputProvider'
import SlackMarkdown from '../../../src/markdown/slackMarkdown'
import { ChangelogConfig } from '../../../src/contracts/types'
import { IMarkdown } from '../../../src/contracts/interfaces'

describe('conventionalOutputProvider', () => {
  it('returns expected output', async () => {
    const markdownWriter = tsSinon.stubInterface<IMarkdown>()
    markdownWriter.heading.returns('header:')
    markdownWriter.ul.returns('expected output')
    const changelogConfig: ChangelogConfig = {
      types: new Map([
        ['feat', { type: 'feat', section: 'Features', hidden: false }],
        ['fix', { type: 'fix', section: 'Fixes', hidden: false }],
      ]),
    }
    const sut = new ConventionalOutputProvider(markdownWriter, changelogConfig)
    const commits: ReadonlyArray<Commit> = [
      { sha: 'abc1234', header: 'fix: my fix', rawBody: 'fix: my fix' },
    ]
    const actual = await sut.execute(commits)
    expect(actual).to.equal('header:expected output')
  })

  context('1 feature commit', () => {
    it('returns features section', async () => {
      const commits: Commit[] = [
        { sha: 'abcd123', rawBody: 'feat: my feature', header: 'feat: my feature' },
      ]
      const markdownWriter = new SlackMarkdown()
      const changelogConfig = getDefaultConfig()
      const sut = new ConventionalOutputProvider(markdownWriter, changelogConfig)
      const actual = await sut.execute(commits)
      expect(actual).to.equal('*Features*\n• abcd123 my feature\n\n')
    })
  })

  context('1 breaking change feature commit', () => {
    it('returns 2 sections: breaking changes and features', async () => {
      const commits: Commit[] = [
        { sha: 'abcd123', rawBody: 'feat!: my feature', header: 'feat: my feature' },
      ]
      const markdownWriter = new SlackMarkdown()
      const changelogConfig = getDefaultConfig()
      const sut = new ConventionalOutputProvider(markdownWriter, changelogConfig)
      const actual = await sut.execute(commits)
      expect(actual).to.equal(
        '*BREAKING CHANGES*\n• my feature\n\n*Features*\n• abcd123 my feature\n\n',
      )
    })
  })

  context('1 chore commit (section hidden by default)', () => {
    it('returns empty string', async () => {
      const commits: Commit[] = [
        { sha: 'acbd123', rawBody: 'chore: my chore', header: 'chore: my chore' },
      ]
      const markdownWriter = new SlackMarkdown()
      const changelogConfig = getDefaultConfig()
      const sut = new ConventionalOutputProvider(markdownWriter, changelogConfig)
      const actual = await sut.execute(commits)
      expect(actual).to.equal('')
    })
  })

  context('1 custom commit type (does not exist in config)', () => {
    it('returns empty string', async () => {
      const commits: Commit[] = [
        { sha: 'acbd123', rawBody: 'wip: my feature', header: 'wip: my feature' },
      ]
      const markdownWriter = new SlackMarkdown()
      const changelogConfig = getDefaultConfig()
      const sut = new ConventionalOutputProvider(markdownWriter, changelogConfig)
      const actual = await sut.execute(commits)
      expect(actual).to.equal('')
    })
  })

  context('1 feature commit with scope', () => {
    it('returns features section with scope in bold', async () => {
      const commits: Commit[] = [
        { sha: 'abcd123', rawBody: 'feat(ux): my feature', header: 'feat(ux): my feature' },
      ]
      const markdownWriter = new SlackMarkdown()
      const changelogConfig = getDefaultConfig()
      const sut = new ConventionalOutputProvider(markdownWriter, changelogConfig)
      const actual = await sut.execute(commits)
      expect(actual).to.equal('*Features*\n• abcd123 *ux:* my feature\n\n')
    })
  })

  context('1 non-conventional commit', () => {
    it('returns other section', async () => {
      const commits: Commit[] = [{ sha: 'abcd123', rawBody: 'my feature', header: 'my feature' }]
      const markdownWriter = new SlackMarkdown()
      const changelogConfig = getDefaultConfig()
      const sut = new ConventionalOutputProvider(markdownWriter, changelogConfig)
      const actual = await sut.execute(commits)
      expect(actual).to.equal('*Other*\n• abcd123 my feature\n\n')
    })
  })

  context('2 feature commits', () => {
    it('returns features section with 2 commits', async () => {
      const commits: Commit[] = [
        { sha: 'abcd123', rawBody: 'feat: feature 1', header: 'feat: feature 1' },
        { sha: 'abcd124', rawBody: 'feat: feature 2', header: 'feat: feature 2' },
      ]
      const markdownWriter = new SlackMarkdown()
      const changelogConfig = getDefaultConfig()
      const sut = new ConventionalOutputProvider(markdownWriter, changelogConfig)
      const actual = await sut.execute(commits)
      expect(actual).to.equal('*Features*\n• abcd123 feature 1\n• abcd124 feature 2\n\n')
    })
  })

  context('1 commit that starts with "chore(release):"', () => {
    it('returns empty string', async () => {
      const commits: Commit[] = [
        { sha: 'abcd123', rawBody: 'chore(release): v1.0.0', header: 'chore(release): v1.0.0' },
      ]
      const markdownWriter = new SlackMarkdown()
      const changelogConfig = getDefaultConfig()
      const sut = new ConventionalOutputProvider(markdownWriter, changelogConfig)
      const actual = await sut.execute(commits)
      expect(actual).to.equal('')
    })
  })
})
