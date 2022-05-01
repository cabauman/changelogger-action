import * as core from '@actions/core'
import * as tsSinon from 'ts-sinon'
import { expect } from 'chai'
import CompositionRoot from '../../src/compositionRoot'
import { IResultSetter } from '../../src/contracts/interfaces'
import { ActionInput, ActionContext, CommitRefRange } from '../../src/contracts/types'
import WorkflowIdProvider from '../../src/helpers/workflowIdProvider'
import WorkflowShaProvider from '../../src/helpers/workflowShaProvider'

class TestCompositionRoot extends CompositionRoot {
  public resultSetter?: IResultSetter

  public constructor() {
    super()
    core.info('constructing TestCompositionRoot...')
  }

  protected getInput(): ActionInput {
    return {
      isConventional: true,
      markdownFlavor: 'github',
      maxCommits: '50',
      preamble: 'Commit List:',
      token: 'dummy-token',
    }
  }

  protected getContext(): ActionContext {
    return {
      owner: 'colt',
      repo: 'CommitsDiff',
      ref: 'refs/heads/feat/conventional-commits',
      runId: 1,
    }
  }

  protected getResultSetter(): IResultSetter {
    this.resultSetter ??= tsSinon.stubInterface<IResultSetter>()
    return this.resultSetter
  }

  protected getWorkflowIdProvider() {
    const testStub = tsSinon.stubConstructor(WorkflowIdProvider)
    testStub.execute.resolves(2)
    return testStub
  }

  protected getWorkflowShaProvider() {
    const testStub = tsSinon.stubConstructor(WorkflowShaProvider)
    testStub.execute.resolves('52185e6c46d59245a32f2bd423a91cd39b4954a8')
    return testStub
  }

  protected getCommitRefValidator() {
    return async (commitRef: string) => {
      return
    }
  }

  protected getCommitProvider() {
    return async ({ previousRef, currentRef }: CommitRefRange, delimeter: string) => {
      return `47c6658|feat: my feature\n${delimeter}\n47c6658|fix: my fix\n${delimeter}`
    }
  }

  protected getPreviousTagProvider() {
    return async (currentTag: string) => {
      // TODO: Implement.
      return ''
    }
  }
}

describe('compositionRoot', () => {
  it('creates Action and runs without error', async () => {
    const result = TestCompositionRoot.constructAction()
    expect(result == null).to.be.false
    await result.run()
  })
})
