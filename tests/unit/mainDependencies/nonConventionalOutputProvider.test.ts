import { expect } from 'chai'
import * as tsSinon from 'ts-sinon'
import { Commit } from '../../../src/contracts/types'
import NonConventionalOutputProvider from '../../../src/mainDependencies/nonConventionalOutputProvider'
import { IMarkdown } from '../../../src/contracts/interfaces'

describe('NonConventionalOutputProvider', () => {
  it('returns expected output', async () => {
    const markdownWriter = tsSinon.stubInterface<IMarkdown>()
    markdownWriter.ul.returns('My fix')
    const sut = new NonConventionalOutputProvider(markdownWriter)
    const commits: ReadonlyArray<Commit> = [
      { commitHash: 'abc1234', header: 'My fix', rawBody: 'My fix' },
    ]
    const actual = await sut.execute(commits)
    expect(actual).to.equal('My fix')
  })
})
