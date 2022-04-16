import { expect } from 'chai'
import GitHubMarkdown from '../../../src/markdown/githubMarkdown'

describe('GitHubMarkdown', () => {
  context('bold', () => {
    it('returns expected', async () => {
      const sut = new GitHubMarkdown()
      const targetText = 'hello, world'
      const actual = sut.bold(targetText)
      expect(actual).to.equal(`**${targetText}**`)
    })
  })

  context('heading', () => {
    it('returns expected', async () => {
      const sut = new GitHubMarkdown()
      const targetText = 'hello, world'
      const actual = sut.heading(targetText)
      expect(actual).to.equal(`### ${targetText}\n\n`)
    })
  })

  context('link', () => {
    it('returns expected', async () => {
      const sut = new GitHubMarkdown()
      const link = 'https://www.github.com'
      const display = 'my link'
      const actual = sut.link(link, display)
      expect(actual).to.equal(`[${display}](${link})`)
    })
  })

  context('ul', () => {
    it('returns expected', async () => {
      const sut = new GitHubMarkdown()
      const targetText1 = 'item 1'
      const targetText2 = 'item 2'
      const actual = sut.ul([targetText1, targetText2])
      expect(actual).to.equal(`* ${targetText1}\n* ${targetText2}\n\n`)
    })
  })
})
