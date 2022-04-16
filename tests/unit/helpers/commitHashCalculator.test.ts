import { expect } from 'chai'
import * as tsSinon from 'ts-sinon'
import CommitHashCalculator from '../../../src/helpers/commitHashCalculator'
import WorkflowIdProvider from '../../../src/helpers/workflowIdProvider'
import WorkflowShaProvider from '../../../src/helpers/workflowShaProvider'

describe('CommitHashCalculator', () => {
  it('return expected sha', async () => {
    const branchName = 'my-branch'
    const workflowId = 45
    const workflowIdProvider = tsSinon.stubConstructor(WorkflowIdProvider)
    const workflowShaProvider = tsSinon.stubConstructor(WorkflowShaProvider)
    workflowIdProvider.execute.resolves(workflowId)
    workflowShaProvider.execute.withArgs(branchName, workflowId).resolves('abc1234')
    const commitRefValidator = async (commitRef: string) => {
      return
    }
    const sut = new CommitHashCalculator(
      workflowIdProvider,
      workflowShaProvider,
      commitRefValidator,
    )
    const actual = await sut.execute(branchName)
    const expected = 'abc1234'
    expect(actual).to.equal(expected)
  })
})
