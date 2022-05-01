import { expect } from 'chai'
import * as tsSinon from 'ts-sinon'
import { Commit } from '../../../src/contracts/types'
import IMarkdown from '../../../src/markdown/markdown'
import CommitsToMarkdownTranformer from '../../../src/mainDependencies/commitsToMarkdownTranformer'
import { ActionInput } from '../../../src/contracts/types'

describe('commitsToMarkdownTranformer', () => {
  it('returns expected output', async () => {
    const input: ActionInput = {
      isConventional: false,
      markdownFlavor: 'github',
      maxCommits: '50',
      preamble: 'Commit list:',
      token: 'my-token',
    }
    const markdownWriter = tsSinon.stubInterface<IMarkdown>()
    markdownWriter.ul.returns('expected output')
    const sut = new CommitsToMarkdownTranformer(input, markdownWriter)
    const commits: ReadonlyArray<Commit> = [
      { commitHash: 'abc1234', header: 'My fix', rawBody: 'My fix' },
    ]
    const actual = await sut.execute(commits)
    expect(actual).to.equal('Commit list:expected output')
  })
})
