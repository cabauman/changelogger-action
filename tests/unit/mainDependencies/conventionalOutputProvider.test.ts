import { expect } from 'chai'
import * as tsSinon from 'ts-sinon'
import { Commit, RawChangelogConfig } from '../../../src/contracts/types'
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
        {
          sha: 'abcd123',
          rawBody: 'feat: my feature',
          header: 'feat: my feature',
        },
      ]
      const markdownWriter = new SlackMarkdown()
      const changelogConfig = getDefaultConfig()
      const sut = new ConventionalOutputProvider(
        markdownWriter,
        changelogConfig,
      )
      const actual = await sut.execute(commits)
      expect(actual).to.equal('*Features*\n• abcd123 my feature\n\n')
    })
  })

  context(
    '1 breaking change (exclamation point) feature commit with scope',
    () => {
      it('returns 2 sections: breaking changes and features', async () => {
        const commits: Commit[] = [
          {
            sha: 'abcd123',
            rawBody: 'feat(myscope)!: my feature',
            header: 'feat(myscope)!: my feature',
          },
        ]
        const markdownWriter = new SlackMarkdown()
        const changelogConfig = getDefaultConfig()
        const sut = new ConventionalOutputProvider(
          markdownWriter,
          changelogConfig,
        )
        const actual = await sut.execute(commits)
        expect(actual).to.equal(
          '*⚠️ BREAKING CHANGES*\n• abcd123 *myscope:* my feature\n\n*Features*\n• abcd123 *myscope:* my feature\n\n',
        )
      })
    },
  )

  context(
    '1 breaking change (exclamation point) refactor commit without scope',
    () => {
      it('returns 2 sections: breaking changes and refactor', async () => {
        const commits: Commit[] = [
          {
            sha: 'abcd123',
            rawBody: 'refactor!: my refactor',
            header: 'refactor!: my refactor',
          },
        ]
        const rawChangelogConfig: RawChangelogConfig = {
          types: [{ type: 'refactor', section: 'Refactor' }],
        }
        const markdownWriter = new SlackMarkdown()
        const changelogConfig = getDefaultConfig(rawChangelogConfig)
        const sut = new ConventionalOutputProvider(
          markdownWriter,
          changelogConfig,
        )
        const actual = await sut.execute(commits)
        expect(actual).to.equal(
          '*⚠️ BREAKING CHANGES*\n• abcd123 my refactor\n\n*Refactor*\n• abcd123 my refactor\n\n',
        )
      })
    },
  )

  context(
    '1 breaking change (BREAKING CHANGE text in body) fix commit without scope',
    () => {
      it('returns 2 sections: breaking changes and bug fixes', async () => {
        const commits: Commit[] = [
          {
            sha: 'abcd123',
            rawBody: 'fix: my fix\n\nBREAKING CHANGE: xyz is gone',
            header: 'fix: my fix',
          },
        ]
        const markdownWriter = new SlackMarkdown()
        const changelogConfig = getDefaultConfig()
        const sut = new ConventionalOutputProvider(
          markdownWriter,
          changelogConfig,
        )
        const actual = await sut.execute(commits)
        expect(actual).to.equal(
          '*⚠️ BREAKING CHANGES*\n• abcd123 my fix\n\n*Bug Fixes*\n• abcd123 my fix\n\n',
        )
      })
    },
  )

  context('1 chore commit (section hidden by default)', () => {
    it('returns empty string', async () => {
      const commits: Commit[] = [
        {
          sha: 'acbd123',
          rawBody: 'chore: my chore',
          header: 'chore: my chore',
        },
      ]
      const markdownWriter = new SlackMarkdown()
      const changelogConfig = getDefaultConfig()
      const sut = new ConventionalOutputProvider(
        markdownWriter,
        changelogConfig,
      )
      const actual = await sut.execute(commits)
      expect(actual).to.equal('')
    })
  })

  context('1 custom commit type (does not exist in config)', () => {
    it('returns empty string', async () => {
      const commits: Commit[] = [
        {
          sha: 'acbd123',
          rawBody: 'wip: my feature',
          header: 'wip: my feature',
        },
      ]
      const markdownWriter = new SlackMarkdown()
      const changelogConfig = getDefaultConfig()
      const sut = new ConventionalOutputProvider(
        markdownWriter,
        changelogConfig,
      )
      const actual = await sut.execute(commits)
      expect(actual).to.equal('')
    })
  })

  context('1 feature commit with scope', () => {
    it('returns features section with scope in bold', async () => {
      const commits: Commit[] = [
        {
          sha: 'abcd123',
          rawBody: 'feat(ux): my feature',
          header: 'feat(ux): my feature',
        },
      ]
      const markdownWriter = new SlackMarkdown()
      const changelogConfig = getDefaultConfig()
      const sut = new ConventionalOutputProvider(
        markdownWriter,
        changelogConfig,
      )
      const actual = await sut.execute(commits)
      expect(actual).to.equal('*Features*\n• abcd123 *ux:* my feature\n\n')
    })
  })

  context('1 non-conventional commit', () => {
    it('returns empty string', async () => {
      const commits: Commit[] = [
        { sha: 'abcd123', rawBody: 'my feature', header: 'my feature' },
      ]
      const markdownWriter = new SlackMarkdown()
      const changelogConfig = getDefaultConfig()
      const sut = new ConventionalOutputProvider(
        markdownWriter,
        changelogConfig,
      )
      const actual = await sut.execute(commits)
      expect(actual).to.equal('')
    })
  })

  context('2 feature commits', () => {
    it('returns features section with 2 commits', async () => {
      const commits: Commit[] = [
        {
          sha: 'abcd123',
          rawBody: 'feat: feature 1',
          header: 'feat: feature 1',
        },
        {
          sha: 'abcd124',
          rawBody: 'feat: feature 2',
          header: 'feat: feature 2',
        },
      ]
      const markdownWriter = new SlackMarkdown()
      const changelogConfig = getDefaultConfig()
      const sut = new ConventionalOutputProvider(
        markdownWriter,
        changelogConfig,
      )
      const actual = await sut.execute(commits)
      expect(actual).to.equal(
        '*Features*\n• abcd123 feature 1\n• abcd124 feature 2\n\n',
      )
    })
  })

  context('1 commit that starts with "chore(release):"', () => {
    it('returns empty string', async () => {
      const commits: Commit[] = [
        {
          sha: 'abcd123',
          rawBody: 'chore(release): v1.0.0',
          header: 'chore(release): v1.0.0',
        },
      ]
      const markdownWriter = new SlackMarkdown()
      const changelogConfig = getDefaultConfig()
      const sut = new ConventionalOutputProvider(
        markdownWriter,
        changelogConfig,
      )
      const actual = await sut.execute(commits)
      expect(actual).to.equal('')
    })
  })

  // TODO: Add a variety of input.
  context(
    '1 revert commit where the first letter of the type is capitalized',
    () => {
      it('returns revert section with 1 commit', async () => {
        const commits: Commit[] = [
          {
            sha: 'abcd123',
            rawBody: 'Revert: This reverts commit abc',
            header: 'Revert: This reverts commit abc',
          },
        ]
        const markdownWriter = new SlackMarkdown()
        const changelogConfig = getDefaultConfig()
        const sut = new ConventionalOutputProvider(
          markdownWriter,
          changelogConfig,
        )
        const actual = await sut.execute(commits)
        expect(actual).to.equal(
          '*Reverts*\n• abcd123 This reverts commit abc\n\n',
        )
      })
    },
  )
})
