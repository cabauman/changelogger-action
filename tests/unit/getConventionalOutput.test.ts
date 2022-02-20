import { expect } from 'chai'
import { Commit } from '../../src/commit'
import { getDefaultConfig } from '../../src/defaultConfig'
import getConventionalOutput from '../../src/getConventionalOutput'
import SlackMarkdown from '../../src/slackMarkdown'

describe('getConventionalOutput', () => {
  context('1 feature commit', () => {
    it('returns features section', async () => {
      const commits: Commit[] = [
        { commitHash: 'acbd123', rawBody: 'feat: my feature', header: 'feat: my feature' },
      ]
      const markdown = new SlackMarkdown()
      const config = getDefaultConfig()
      const actual = await getConventionalOutput(commits, markdown, config)
      expect(actual).to.equal('*Features*\n• my feature\n\n')
    })
  })

  context('1 breaking change feature commit', () => {
    it('returns 2 sections: breaking changes and features', async () => {
      const commits: Commit[] = [
        { commitHash: 'acbd123', rawBody: 'feat!: my feature', header: 'feat: my feature' },
      ]
      const markdown = new SlackMarkdown()
      const config = getDefaultConfig()
      const actual = await getConventionalOutput(commits, markdown, config)
      expect(actual).to.equal('*BREAKING CHANGES*\n• my feature\n\n*Features*\n• my feature\n\n')
    })
  })

  context('1 chore commit (section hidden by default)', () => {
    it('returns empty string', async () => {
      const commits: Commit[] = [
        { commitHash: 'acbd123', rawBody: 'chore: my chore', header: 'chore: my chore' },
      ]
      const markdown = new SlackMarkdown()
      const config = getDefaultConfig()
      const actual = await getConventionalOutput(commits, markdown, config)
      expect(actual).to.equal('')
    })
  })

  context('1 custom commit type (does not exist in config)', () => {
    it('returns empty string', async () => {
      const commits: Commit[] = [
        { commitHash: 'acbd123', rawBody: 'wip: my feature', header: 'wip: my feature' },
      ]
      const markdown = new SlackMarkdown()
      const config = getDefaultConfig()
      const actual = await getConventionalOutput(commits, markdown, config)
      expect(actual).to.equal('')
    })
  })

  context('1 feature commit with scope', () => {
    it('returns features section with scope in bold', async () => {
      const commits: Commit[] = [
        { commitHash: 'acbd123', rawBody: 'feat(ux): my feature', header: 'feat(ux): my feature' },
      ]
      const markdown = new SlackMarkdown()
      const config = getDefaultConfig()
      const actual = await getConventionalOutput(commits, markdown, config)
      expect(actual).to.equal('*Features*\n• *ux: *my feature\n\n')
    })
  })

  context('1 non-conventional commit', () => {
    it('returns other section', async () => {
      const commits: Commit[] = [
        { commitHash: 'acbd123', rawBody: 'my feature', header: 'my feature' },
      ]
      const markdown = new SlackMarkdown()
      const config = getDefaultConfig()
      const actual = await getConventionalOutput(commits, markdown, config)
      expect(actual).to.equal('*Other*\n• my feature\n\n')
    })
  })

  context('2 feature commits', () => {
    it('returns features section with 2 commits', async () => {
      const commits: Commit[] = [
        { commitHash: 'acbd123', rawBody: 'feat: feature 1', header: 'feat: feature 1' },
        { commitHash: 'acbd123', rawBody: 'feat: feature 2', header: 'feat: feature 2' },
      ]
      const markdown = new SlackMarkdown()
      const config = getDefaultConfig()
      const actual = await getConventionalOutput(commits, markdown, config)
      expect(actual).to.equal('*Features*\n• feature 1\n• feature 2\n\n')
    })
  })
})
