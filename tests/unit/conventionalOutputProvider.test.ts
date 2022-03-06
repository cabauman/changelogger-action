import { expect } from 'chai'
import * as tsSinon from 'ts-sinon'
import { Commit } from '../../src/commit'
import { ChangelogConfig } from '../../src/getConventionalOutput'
import IMarkdown from '../../src/markdown'
import ConventionalOutputProvider from '../../src/newStructure/conventionalOutputProvider'
import { IActionInput } from '../../src/newStructure/interfaces'

describe('conventionalOutputProvider', () => {
  it('returns expected output', async () => {
    const input: IActionInput = {
      isConventional: true,
      markdownFlavor: 'github',
      maxCommits: '50',
      preamble: 'Commit list:',
      token: 'my-token',
    }
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
      { commitHash: 'abc1234', header: 'fix: my fix', rawBody: 'fix: my fix' },
    ]
    const actual = await sut.execute(commits)
    expect(actual).to.equal('header:expected output')
  })
})
