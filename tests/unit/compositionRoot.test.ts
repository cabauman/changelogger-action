import * as core from '@actions/core'
import * as github from '@actions/github'
import * as tsSinon from 'ts-sinon'
import { expect } from 'chai'
import CompositionRoot from '../../src/compositionRoot'
import { IResultSetter } from '../../src/contracts/interfaces'
import { ActionInput, ActionContext, CommitRefRange } from '../../src/contracts/types'
import WorkflowIdProvider from '../../src/helpers/workflowIdProvider'
import WorkflowShaProvider from '../../src/helpers/workflowShaProvider'

// TODO: Replace test composition roots with builder pattern.
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
      preamble: 'Commit List:',
      token: 'dummy-token',
      branchComparisonStrategy: 'tag',
    }
  }

  protected getContext(): ActionContext {
    return {
      owner: 'colt',
      repo: 'Changelogger',
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

  context('getInput.markdownFlavor = slack', () => {
    class TestCompositionRoot2 extends TestCompositionRoot {
      protected getInput(): ActionInput {
        const input = super.getInput()
        input.markdownFlavor = 'slack'
        return input
      }
    }

    it('creates Action and runs without error', async () => {
      const result = TestCompositionRoot2.constructAction()
      expect(result == null).to.be.false
      await result.run()
    })
  })

  context('getInput.isConventional = false', () => {
    class TestCompositionRoot2 extends TestCompositionRoot {
      protected getInput(): ActionInput {
        const input = super.getInput()
        input.isConventional = false
        return input
      }
    }

    it('creates Action and runs without error', async () => {
      const result = TestCompositionRoot2.constructAction()
      expect(result == null).to.be.false
      await result.run()
    })
  })

  context.skip('................', () => {
    it('----------------------------', async () => {
      tsSinon.default.stub(github.context, 'repo').get(() => {
        return {
          owner: 'colt',
          repo: 'Changelogger',
        }
      })
      github.context.ref = 'refs/heads/feat/conventional-commits'
      github.context.runId = 1

      const result = TestCompositionRootBase.constructAction()
      expect(result == null).to.be.false
      await result.run()
    })
  })
})

// TODO: Replace test composition roots with builder pattern.
class TestCompositionRootBase extends CompositionRoot {
  public resultSetter?: IResultSetter

  public constructor() {
    super()
    core.info('constructing TestCompositionRoot...')
  }

  protected getInput(): ActionInput {
    return {
      isConventional: true,
      markdownFlavor: 'github',
      preamble: 'Commit List:',
      token: 'dummy-token',
      branchComparisonStrategy: 'tag',
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
