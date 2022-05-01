import { expect } from 'chai'
import { Commit } from '../../../src/contracts/types'
import CommitListCalculator from '../../../src/mainDependencies/commitListCalculator'
import { CommitRefRange } from '../../../src/contracts/types'

describe('CommitListCalculator', () => {
  it('returns list of 2 commits', async () => {
    const commitProvider = async (
      { previousRef, currentRef }: CommitRefRange,
      delimeter: string,
    ) => {
      return `abc0123|feat: my feature\n${delimeter}\nabc1234|fix: my fix\n${delimeter}\n`
    }
    const sut = new CommitListCalculator(commitProvider)
    const commitRefRange: CommitRefRange = { previousRef: '', currentRef: '' }
    const actual = await sut.execute(commitRefRange)
    const expected: ReadonlyArray<Commit> = [
      { commitHash: 'abc0123', header: 'feat: my feature', rawBody: 'feat: my feature' },
      { commitHash: 'abc1234', header: 'fix: my fix', rawBody: 'fix: my fix' },
    ]
    expect(actual).to.deep.equal(expected)
  })
})
