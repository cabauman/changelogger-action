import * as core from '@actions/core'
import * as github from '@actions/github'
import * as exec from '@actions/exec'
import retrieveAndValidateInput from './config/getInput'
import GitHubMarkdown from './markdown/githubMarkdown'
import SlackMarkdown from './markdown/slackMarkdown'
import CommitHashCalculator from './helpers/commitHashCalculator'
import CommitListCalculator from './mainDependencies/commitListCalculator'
import CommitRefRangeCalculator from './mainDependencies/commitRefRangeCalculator'
import NonConventionalOutputProvider from './mainDependencies/nonConventionalOutputProvider'
import GitHubAction from './githubAction'
import { IResultSetter, IOutputProvider } from './contracts/interfaces'
import { ActionInput, ActionContext, CommitRefRange } from './contracts/types'
import WorkflowIdProvider from './helpers/workflowIdProvider'
import WorkflowShaProvider from './helpers/workflowShaProvider'
import ConventionalOutputProvider from './mainDependencies/conventionalOutputProvider'
import { getChangelogConfig } from './config/getChangelogConfig'
import DecoratedOutputProvider from './mainDependencies/decoratedOutputProvider'
import { GitHub } from '@actions/github/lib/utils'
import { error2Json } from './utils/errorUtil'

export default class CompositionRoot {
  private actionInput?: ActionInput
  private actionContext?: ActionContext
  private octokit?: InstanceType<typeof GitHub>

  protected constructAction(): GitHubAction {
    return new GitHubAction(
      this.getCommitRefRangeCalculator(),
      this.getCommitListCalculator(),
      this.getOutputProvider(),
      this.getResultSetter(),
    )
  }

  public static constructAction() {
    const compositionRoot = new this()
    return compositionRoot.constructAction()
  }

  // =============== BEGIN Override in tests =============== //
  protected getInput(): ActionInput {
    this.actionInput ??= retrieveAndValidateInput(core)
    return this.actionInput
  }

  protected getContext(): ActionContext {
    this.actionContext ??= {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      ref: github.context.ref,
      runId: github.context.runId,
    }
    return this.actionContext
  }

  protected getResultSetter(): IResultSetter {
    return core
  }

  protected getOctokit(): InstanceType<typeof GitHub> {
    this.octokit ??= github.getOctokit(this.getInput().token)
    return this.octokit
  }

  protected getWorkflowIdProvider() {
    return new WorkflowIdProvider(this.getOctokit(), this.getContext())
  }

  protected getWorkflowShaProvider() {
    return new WorkflowShaProvider(
      this.getOctokit(),
      this.getContext(),
      this.getCommitRefValidator(),
    )
  }

  protected getCommitRefValidator() {
    return async (commitRef: string) => {
      await exec.exec(`git cat-file -t ${commitRef}`)
      return
    }
  }

  protected getCommitProvider() {
    return async (
      { previousRef, currentRef }: CommitRefRange,
      delimeter: string,
    ) => {
      await exec.exec('git fetch origin')
      const gitLog = await exec.getExecOutput(
        `git log ${previousRef}..${currentRef} --format=%h|%B${delimeter}`,
      )
      return gitLog.stdout
    }
  }

  protected getPreviousTagProvider() {
    const regex = /^v[0-9]+\.[0-9]+\.[0-9]+$/
    return async (currentTag: string): Promise<string> => {
      let current: string | null = currentTag
      const isShallow: exec.ExecOutput = await exec.getExecOutput(
        `git rev-parse --is-shallow-repository`,
      )
      if (isShallow.stdout.trim() === 'true') {
        await exec.exec('git fetch origin --unshallow')
      }
      // TODO: Consider using a fancier command, such as git + grep, rather than a loop.
      do {
        try {
          const gitDescribe: exec.ExecOutput = await exec.getExecOutput(
            `git describe --tags --abbrev=0 ${current}^`,
          )
          current = gitDescribe.stdout.trim()
        } catch (error) {
          core.error(`[getPreviousTagProvider] ${error2Json(error)}`)
          current = null
        }
      } while (current != null && !regex.test(current))

      return current ?? currentTag
    }
  }
  // =============== END Override in tests =============== //

  protected getCommitRefRangeCalculator() {
    const { ref: githubRef } = this.getContext()
    const { branchComparisonStrategy } = this.getInput()
    return new CommitRefRangeCalculator(
      { githubRef, branchComparisonStrategy },
      this.getCommitHashCalculator(),
      this.getPreviousTagProvider(),
    )
  }

  protected getCommitListCalculator() {
    return new CommitListCalculator(this.getCommitProvider())
  }

  protected getOutputProvider(): IOutputProvider {
    const markdownWriter = this.getMarkdown()
    let outputProvider: IOutputProvider
    if (this.getInput().isConventional) {
      outputProvider = new ConventionalOutputProvider(
        markdownWriter,
        getChangelogConfig(),
      )
    } else {
      outputProvider = new NonConventionalOutputProvider(markdownWriter)
    }
    return new DecoratedOutputProvider(
      outputProvider,
      markdownWriter,
      this.getInput().preamble,
    )
  }

  protected getCommitHashCalculator() {
    return new CommitHashCalculator(
      this.getWorkflowIdProvider(),
      this.getWorkflowShaProvider(),
    )
  }

  protected getMarkdown() {
    // TODO: Implement markdown flavor.
    return this.getInput().outputFlavor === 'slack'
      ? new SlackMarkdown()
      : new GitHubMarkdown()
  }
}
