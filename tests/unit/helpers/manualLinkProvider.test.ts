import { expect } from 'chai'
import { ManualLinkProvider } from '../../../src/helpers/manualLinkProvider'
import GitHubMarkdown from '../../../src/markdown/githubMarkdown'

describe('ManualLinkProvider', () => {
  context('provided sha is "abc1234"; markdown flavor is github', () => {
    it('returns "[`abc1234`](https://github.com/ownerA/repo1/commit/abc1234)"', async () => {
      // Arrange
      const sha = 'abc1234'
      const baseUrl = new URL('https://github.com/ownerA/repo1')
      const markdown = new GitHubMarkdown()
      const sut = new ManualLinkProvider(baseUrl, markdown)

      // Act
      const actual = sut.getShaLink(sha)

      // Assert
      const expected =
        '[`abc1234`](https://github.com/ownerA/repo1/commit/abc1234)'
      expect(actual).to.equal(expected)
    })
  })
})
