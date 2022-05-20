import { expect } from 'chai'
import * as tsSinon from 'ts-sinon'
import CommitHashCalculator from '../../../src/helpers/commitHashCalculator'
import WorkflowIdProvider from '../../../src/helpers/workflowIdProvider'
import WorkflowShaProvider from '../../../src/helpers/workflowShaProvider'

describe('CommitHashCalculator', () => {
  context('workflowShaProvider returns abc1234', () => {
    it('return abc1234', async () => {
      // Arrange
      const branchName = 'my-branch'
      const workflowId = 45
      const workflowIdProvider = tsSinon.stubConstructor(WorkflowIdProvider)
      const workflowShaProvider = tsSinon.stubConstructor(WorkflowShaProvider)
      workflowIdProvider.execute.resolves(workflowId)
      workflowShaProvider.execute
        .withArgs(branchName, workflowId)
        .resolves('abc1234')
      const sut = new CommitHashCalculator(
        workflowIdProvider,
        workflowShaProvider,
      )

      // Act
      const actual = await sut.execute(branchName)

      // Assert
      const expected = 'abc1234'
      expect(actual).to.equal(expected)
    })
  })

  context('workflowShaProvider returns undefined', () => {
    it('return undefined', async () => {
      // Arrange
      const branchName = 'my-branch'
      const workflowId = 45
      const workflowIdProvider = tsSinon.stubConstructor(WorkflowIdProvider)
      const workflowShaProvider = tsSinon.stubConstructor(WorkflowShaProvider)
      workflowIdProvider.execute.resolves(workflowId)
      workflowShaProvider.execute
        .withArgs(branchName, workflowId)
        .resolves(undefined)
      const sut = new CommitHashCalculator(
        workflowIdProvider,
        workflowShaProvider,
      )

      // Act
      const actual = await sut.execute(branchName)

      // Assert
      const expected = undefined
      expect(actual).to.equal(expected)
    })
  })
})
