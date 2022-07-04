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
import {
  IResultSetter,
  IOutputProvider,
  ILinkProvider,
  IMarkdown,
} from './contracts/interfaces'
import { ActionInput, ActionContext, CommitRefRange } from './contracts/types'
import WorkflowIdProvider from './helpers/workflowIdProvider'
import WorkflowShaProvider from './helpers/workflowShaProvider'
import ConventionalOutputProvider from './mainDependencies/conventionalOutputProvider'
import { getChangelogConfig } from './config/getChangelogConfig'
import DecoratedOutputProvider from './mainDependencies/decoratedOutputProvider'
import { GitHub } from '@actions/github/lib/utils'
import { error2Json } from './utils/errorUtil'
import ConventionalProvider from './helpers/conventionalProvider'
import { ManualLinkProvider } from './helpers/manualLinkProvider'
import { AutoLinkProvider } from './helpers/autoLinkProvider'

export default class CompositionRoot {
  private actionInput?: ActionInput
  private actionContext?: ActionContext
  private octokit?: InstanceType<typeof GitHub>
  private markdown?: IMarkdown

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

  protected async getOctokit(): InstanceType<typeof GitHub> {
    await github
      .getOctokit(this.getInput().token)
      //.graphql({request:{}})
      .rest.repos.compareCommits({ owner: '', repo: '', base: '', head: '' })
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

  protected getLatestTagProvider() {
    return async () => {
      const gitDescribe: exec.ExecOutput = await exec.getExecOutput(
        `git describe --tags --abbrev=0`,
      )
      return gitDescribe.stdout.trim()
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

  protected getVersionHeaderProvider() {
    return async (currentVersion: string) => {
      const previousVersion = await this.getPreviousTagProvider()(
        currentVersion,
      )
      const link = `https://github.com/owner/repo/compare/${previousVersion}...${currentVersion}`
      const rawTagDate: exec.ExecOutput = await exec.getExecOutput(
        `git show -s --format=%cs ${currentVersion}`,
      )
      // standard-version tags are annotated. So it prints output like the following:
      /**
       * tag v0.1.1-beta.0
       * Tagger: GitHub Actions Bot <>
       *
       * chore(release): 0.1.1-beta.0 [skip ci]
       * 2022-05-14
       */
      const tagDate = rawTagDate.stdout
        .split('\n')
        .filter((x) => x !== '')
        .pop()
        ?.trim()
      const versionDisplay = currentVersion.substring(1)
      const formattedLink = this.getMarkdown().link(versionDisplay, link)
      return this.getMarkdown().heading(`${formattedLink} (${tagDate})`, 2)
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
    let outputProvider: IOutputProvider
    if (this.getInput().isConventional) {
      outputProvider = new ConventionalOutputProvider(
        this.getConventionalProvider(),
        this.getMarkdown(),
        this.getLinkProvider(),
      )
    } else {
      outputProvider = new NonConventionalOutputProvider(this.getMarkdown())
    }
    return new DecoratedOutputProvider(
      outputProvider,
      this.getMarkdown(),
      this.getInput().preamble,
    )
  }

  protected getConventionalProvider(): ConventionalProvider {
    return new ConventionalProvider(getChangelogConfig())
  }

  protected getLinkProvider(): ILinkProvider {
    const outputFlavor = this.getInput().outputFlavor
    if (outputFlavor === 'github-release') {
      return new AutoLinkProvider()
    }
    const { owner, repo } = this.getContext()
    const baseUrl = new URL(`https://github.com/${owner}/${repo}`)
    return new ManualLinkProvider(baseUrl, this.getMarkdown())
  }

  protected getCommitHashCalculator() {
    return new CommitHashCalculator(
      this.getWorkflowIdProvider(),
      this.getWorkflowShaProvider(),
    )
  }

  protected getMarkdown(): IMarkdown {
    if (this.markdown) {
      return this.markdown
    }
    this.markdown =
      this.getInput().outputFlavor === 'slack'
        ? new SlackMarkdown()
        : new GitHubMarkdown()
    return this.markdown
  }
}
