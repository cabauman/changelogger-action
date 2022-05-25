import { expect } from 'chai'
import { Commit, Section } from '../../../src/contracts/types'
import ConventionalProvider from '../../../src/helpers/conventionalProvider'
import { getDefaultConfig } from '../../../src/config/defaultConfig'

describe('conventionalProvider', () => {
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
      const changelogConfig = getDefaultConfig()
      const sut = new ConventionalProvider(changelogConfig)

      // Act
      const actual = await sut.execute(commits)

      // Assert
      const expected: Record<string, Section> = {
        ['feat']: {
          name: 'Features',
          commits: [
            { scope: undefined, sha: 'abc1234', subject: 'my feature' },
          ],
        },
      }
      expect(actual).to.deep.equal(expected)
    })
  })

  context('1 chore commit (section hidden by default)', () => {
    it('returns empty object (no sections)', async () => {
      const commits: Commit[] = [
        {
          sha: 'acb1234',
          rawBody: 'chore: my chore',
          header: 'chore: my chore',
        },
      ]
      const changelogConfig = getDefaultConfig()
      const sut = new ConventionalProvider(changelogConfig)

      // Act
      const actual = await sut.execute(commits)

      // Assert
      const expected: Record<string, Section> = {}
      expect(actual).to.deep.equal(expected)
    })
  })

  context('1 custom commit type (does not exist in config)', () => {
    it('returns empty object (no sections)', async () => {
      const commits: Commit[] = [
        {
          sha: 'acb1234',
          rawBody: 'wip: my feature',
          header: 'wip: my feature',
        },
      ]
      const changelogConfig = getDefaultConfig()
      const sut = new ConventionalProvider(changelogConfig)

      // Act
      const actual = await sut.execute(commits)

      // Assert
      const expected: Record<string, Section> = {}
      expect(actual).to.deep.equal(expected)
    })
  })

  context('1 commit that starts with "chore(release):"', () => {
    it('returns empty object (no sections)', async () => {
      const commits: Commit[] = [
        {
          sha: 'abc1234',
          rawBody: 'chore(release): v1.0.0',
          header: 'chore(release): v1.0.0',
        },
      ]
      const changelogConfig = getDefaultConfig({
        types: [{ section: 'Chores', type: 'chore', hidden: false }],
      })
      const sut = new ConventionalProvider(changelogConfig)

      // Act
      const actual = await sut.execute(commits)

      // Assert
      const expected: Record<string, Section> = {}
      expect(actual).to.deep.equal(expected)
    })
  })

  // TODO: Add a variety of input.
  context(
    '1 revert commit where the first letter of the type is capitalized',
    () => {
      it('returns revert section with 1 commit', async () => {
        const commits: Commit[] = [
          {
            sha: 'abc1234',
            rawBody: 'Revert: This reverts commit abc',
            header: 'Revert: This reverts commit abc',
          },
        ]
        const changelogConfig = getDefaultConfig({
          types: [{ section: 'Reverts', type: 'revert', hidden: false }],
        })
        const sut = new ConventionalProvider(changelogConfig)

        // Act
        const actual = await sut.execute(commits)

        // Assert
        const expected: Record<string, Section> = {
          ['revert']: {
            name: 'Reverts',
            commits: [
              {
                scope: undefined,
                sha: 'abc1234',
                subject: 'This reverts commit abc',
              },
            ],
          },
        }
        expect(actual).to.deep.equal(expected)
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
        const changelogConfig = getDefaultConfig()
        const sut = new ConventionalProvider(changelogConfig)

        // Act
        const actual = await sut.execute(commits)

        // Assert
        const expected: Record<string, Section> = {
          ['BREAKING']: {
            name: '⚠️ BREAKING CHANGES',
            commits: [{ scope: undefined, sha: 'abc1234', subject: 'my fix' }],
          },
          ['fix']: {
            name: 'Bug Fixes',
            commits: [{ scope: undefined, sha: 'abc1234', subject: 'my fix' }],
          },
        }
        expect(actual).to.deep.equal(expected)
      })
    },
  )

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
        const changelogConfig = getDefaultConfig()
        const sut = new ConventionalProvider(changelogConfig)

        // Act
        const actual = await sut.execute(commits)

        // Assert
        const expected: Record<string, Section> = {
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
        expect(actual).to.deep.equal(expected)
      })
    },
  )
})
