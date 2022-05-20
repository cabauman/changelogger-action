import { expect } from 'chai'
import * as tsSinon from 'ts-sinon'
import { Commit } from '../../../src/contracts/types'
import { IMarkdown, IOutputProvider } from '../../../src/contracts/interfaces'
import DecoratedOutputProvider from '../../../src/mainDependencies/decoratedOutputProvider'

describe('DecoratedOutputProvider', () => {
  it('returns expected output', async () => {
    const preamble = 'Commit list:'
    const markdownWriter = tsSinon.stubInterface<IMarkdown>()
    const outputProvider = tsSinon.stubInterface<IOutputProvider>()
    markdownWriter.ul.returns('My fix')
    markdownWriter.heading.withArgs(preamble, 2).returns('Commit list:\n\n')
    outputProvider.execute.resolves('My fix')
    const sut = new DecoratedOutputProvider(
      outputProvider,
      markdownWriter,
      preamble,
    )
    const commits: ReadonlyArray<Commit> = [
      { sha: 'abc1234', header: 'My fix', rawBody: 'My fix' },
    ]
    const actual = await sut.execute(commits)
    expect(actual).to.equal('Commit list:\n\nMy fix')
  })
})
