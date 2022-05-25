import { expect } from 'chai'
import * as tsSinon from 'ts-sinon'
import { Commit, Section } from '../../../src/contracts/types'
import ConventionalOutputProvider from '../../../src/mainDependencies/conventionalOutputProvider'
import SlackMarkdown from '../../../src/markdown/slackMarkdown'
import { ILinkProvider } from '../../../src/contracts/interfaces'
import ConventionalProvider from '../../../src/helpers/conventionalProvider'

describe('conventionalOutputProvider', () => {
  it('returns expected output', async () => {
    // Arrange
    const commits: ReadonlyArray<Commit> = [
      { sha: 'abc1234', header: 'fix: my fix', rawBody: 'fix: my fix' },
    ]
    const sections: Record<string, Section> = {
      ['fix']: {
        name: 'Bug Fixes',
        commits: [{ scope: undefined, sha: 'abc1234', subject: 'my fix' }],
      },
    }
    const markdownWriter = new SlackMarkdown()
    const conventionalProvider = tsSinon.stubConstructor(ConventionalProvider)
    const linkProvider = tsSinon.stubInterface<ILinkProvider>()

    // Mock return values
    conventionalProvider.execute.resolves(sections)
    linkProvider.getShaLink.returns('abc1234')

    const sut = new ConventionalOutputProvider(
      conventionalProvider,
      markdownWriter,
      linkProvider,
    )

    // Act
    const actual = await sut.execute(commits)

    // Assert
    expect(actual).to.equal('*Bug Fixes*\n• abc1234 my fix\n\n')
  })

  context('1 feature commit', () => {
    it('returns features section', async () => {
      // Arrange
      const commits: Commit[] = [
        {
          sha: 'abc1234',
          rawBody: 'feat: my feature',
          header: 'feat: my feature',
        },
      ]
      const sections: Record<string, Section> = {
        ['feat']: {
          name: 'Features',
          commits: [
            { scope: undefined, sha: 'abc1234', subject: 'my feature' },
          ],
        },
      }
      const markdownWriter = new SlackMarkdown()
      const conventionalProvider = tsSinon.stubConstructor(ConventionalProvider)
      const linkProvider = tsSinon.stubInterface<ILinkProvider>()

      // Mock return values
      conventionalProvider.execute.resolves(sections)
      linkProvider.getShaLink.returns('abc1234')

      const sut = new ConventionalOutputProvider(
        conventionalProvider,
        markdownWriter,
        linkProvider,
      )

      // Act
      const actual = await sut.execute(commits)

      // Assert
      expect(actual).to.equal('*Features*\n• abc1234 my feature\n\n')
    })
  })

  context(
    '1 breaking change (exclamation point) feature commit with scope',
    () => {
      it('returns 2 sections: breaking changes and features', async () => {
        // Arrange
        const commits: Commit[] = [
          {
            sha: 'abc1234',
            rawBody: 'feat(myscope)!: my feature',
            header: 'feat(myscope)!: my feature',
          },
        ]
        const sections: Record<string, Section> = {
          ['BREAKING']: {
            name: '⚠️ BREAKING CHANGES',
            commits: [
              { scope: 'myscope', sha: 'abc1234', subject: 'my feature' },
            ],
          },
          ['feat']: {
            name: 'Features',
            commits: [
              { scope: 'myscope', sha: 'abc1234', subject: 'my feature' },
            ],
          },
        }
        const conventionalProvider =
          tsSinon.stubConstructor(ConventionalProvider)
        const markdownWriter = new SlackMarkdown()
        const linkProvider = tsSinon.stubInterface<ILinkProvider>()

        // Mock return values
        conventionalProvider.execute.resolves(sections)
        linkProvider.getShaLink.returns('abc1234')

        const sut = new ConventionalOutputProvider(
          conventionalProvider,
          markdownWriter,
          linkProvider,
        )

        // Act
        const actual = await sut.execute(commits)

        // Assert
        expect(actual).to.equal(
          '*⚠️ BREAKING CHANGES*\n• abc1234 *myscope:* my feature\n\n*Features*\n• abc1234 *myscope:* my feature\n\n',
        )
      })
    },
  )

  context(
    '1 breaking change (exclamation point) refactor commit without scope',
    () => {
      it('returns 2 sections: breaking changes and refactor', async () => {
        // Arrange
        const commits: Commit[] = [
          {
            sha: 'abc1234',
            rawBody: 'refactor!: my refactor',
            header: 'refactor!: my refactor',
          },
        ]
        const sections: Record<string, Section> = {
          ['BREAKING']: {
            name: '⚠️ BREAKING CHANGES',
            commits: [
              { scope: undefined, sha: 'abc1234', subject: 'my refactor' },
            ],
          },
          ['refactor']: {
            name: 'Refactor',
            commits: [
              { scope: undefined, sha: 'abc1234', subject: 'my refactor' },
            ],
          },
        }
        const conventionalProvider =
          tsSinon.stubConstructor(ConventionalProvider)
        const markdownWriter = new SlackMarkdown()
        const linkProvider = tsSinon.stubInterface<ILinkProvider>()

        // Mock return values
        conventionalProvider.execute.resolves(sections)
        linkProvider.getShaLink.returns('abc1234')

        const sut = new ConventionalOutputProvider(
          conventionalProvider,
          markdownWriter,
          linkProvider,
        )

        // Act
        const actual = await sut.execute(commits)

        // Assert
        expect(actual).to.equal(
          '*⚠️ BREAKING CHANGES*\n• abc1234 my refactor\n\n*Refactor*\n• abc1234 my refactor\n\n',
        )
      })
    },
  )

  context(
    '1 breaking change (BREAKING CHANGE text in body) fix commit without scope',
    () => {
      it('returns 2 sections: breaking changes and bug fixes', async () => {
        // Arrange
        const commits: Commit[] = [
          {
            sha: 'abc1234',
            rawBody: 'fix: my fix\n\nBREAKING CHANGE: xyz is gone',
            header: 'fix: my fix',
          },
        ]
        const sections: Record<string, Section> = {
          ['BREAKING']: {
            name: '⚠️ BREAKING CHANGES',
            commits: [{ scope: undefined, sha: 'abc1234', subject: 'my fix' }],
          },
          ['fix']: {
            name: 'Bug Fixes',
            commits: [{ scope: undefined, sha: 'abc1234', subject: 'my fix' }],
          },
        }
        const conventionalProvider =
          tsSinon.stubConstructor(ConventionalProvider)
        const markdownWriter = new SlackMarkdown()
        const linkProvider = tsSinon.stubInterface<ILinkProvider>()

        // Mock return values
        conventionalProvider.execute.resolves(sections)
        linkProvider.getShaLink.returns('abc1234')

        const sut = new ConventionalOutputProvider(
          conventionalProvider,
          markdownWriter,
          linkProvider,
        )

        // Act
        const actual = await sut.execute(commits)

        // Assert
        expect(actual).to.equal(
          '*⚠️ BREAKING CHANGES*\n• abc1234 my fix\n\n*Bug Fixes*\n• abc1234 my fix\n\n',
        )
      })
    },
  )

  context('1 feature commit with scope', () => {
    it('returns features section with scope in bold', async () => {
      // Arrange
      const commits: Commit[] = [
        {
          sha: 'abc1234',
          rawBody: 'feat(ux): my feature',
          header: 'feat(ux): my feature',
        },
      ]
      const sections: Record<string, Section> = {
        ['feat']: {
          name: 'Features',
          commits: [{ scope: 'ux', sha: 'abc1234', subject: 'my feature' }],
        },
      }
      const conventionalProvider = tsSinon.stubConstructor(ConventionalProvider)
      const markdownWriter = new SlackMarkdown()
      const linkProvider = tsSinon.stubInterface<ILinkProvider>()

      // Mock return values
      conventionalProvider.execute.resolves(sections)
      linkProvider.getShaLink.returns('abc1234')

      const sut = new ConventionalOutputProvider(
        conventionalProvider,
        markdownWriter,
        linkProvider,
      )

      // Act
      const actual = await sut.execute(commits)

      // Assert
      expect(actual).to.equal('*Features*\n• abc1234 *ux:* my feature\n\n')
    })
  })

  context('1 non-conventional commit', () => {
    it('returns empty string', async () => {
      // Arrange
      const commits: Commit[] = [
        { sha: 'abc1234', rawBody: 'my feature', header: 'my feature' },
      ]
      const sections: Record<string, Section> = {}
      const conventionalProvider = tsSinon.stubConstructor(ConventionalProvider)
      const markdownWriter = new SlackMarkdown()
      const linkProvider = tsSinon.stubInterface<ILinkProvider>()

      // Mock return values
      conventionalProvider.execute.resolves(sections)
      linkProvider.getShaLink.returns('abc1234')

      const sut = new ConventionalOutputProvider(
        conventionalProvider,
        markdownWriter,
        linkProvider,
      )

      // Act
      const actual = await sut.execute(commits)

      // Assert
      expect(actual).to.equal('')
    })
  })

  context('2 feature commits', () => {
    it('returns features section with 2 commits', async () => {
      // Arrange
      const commits: Commit[] = [
        {
          sha: 'abc1234',
          rawBody: 'feat: feature 1',
          header: 'feat: feature 1',
        },
        {
          sha: 'abcd123',
          rawBody: 'feat: feature 2',
          header: 'feat: feature 2',
        },
      ]
      const sections: Record<string, Section> = {
        ['feat']: {
          name: 'Features',
          commits: [
            { scope: undefined, sha: 'abc1234', subject: 'feature 1' },
            { scope: undefined, sha: 'abcd123', subject: 'feature 2' },
          ],
        },
      }
      const conventionalProvider = tsSinon.stubConstructor(ConventionalProvider)
      const markdownWriter = new SlackMarkdown()
      const linkProvider = tsSinon.stubInterface<ILinkProvider>()

      // Mock return values
      conventionalProvider.execute.resolves(sections)
      linkProvider.getShaLink.withArgs('abc1234').returns('abc1234')
      linkProvider.getShaLink.withArgs('abcd123').returns('abcd123')

      const sut = new ConventionalOutputProvider(
        conventionalProvider,
        markdownWriter,
        linkProvider,
      )

      // Act
      const actual = await sut.execute(commits)

      // Assert
      expect(actual).to.equal(
        '*Features*\n• abc1234 feature 1\n• abcd123 feature 2\n\n',
      )
    })
  })
})
