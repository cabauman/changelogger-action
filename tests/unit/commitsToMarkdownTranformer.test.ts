import { expect } from 'chai'
import * as tsSinon from 'ts-sinon'
import { Commit } from '../../src/commit'
import IMarkdown from '../../src/markdown'
import CommitsToMarkdownTranformer from '../../src/newStructure/commitsToMarkdownTranformer'
import { IActionInput } from '../../src/newStructure/interfaces'

describe('commitsToMarkdownTranformer', () => {
  it('returns expected output', async () => {
    const input: IActionInput = {
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
