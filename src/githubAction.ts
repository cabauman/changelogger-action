import CommitListCalculator from './mainDependencies/commitListCalculator'
import CommitRefRangeCalculator from './mainDependencies/commitRefRangeCalculator'
import { IOutputProvider, IResultSetter } from './contracts/interfaces'
import { error2Json } from './utils/errorUtil'
import { Commit, CommitInfo, ConventionalCommitInfo } from './contracts/types'
import ConventionalProvider from './helpers/conventionalProvider'
import { getChangelogConfig } from './config/getChangelogConfig'
import { AutoLinkProvider } from './helpers/autoLinkProvider'
import { ConventionalOutputProvider2 } from './mainDependencies/conventionalOutputProvider'

export default class GitHubAction {
  constructor(
    private readonly commitRefRangeCalculator: CommitRefRangeCalculator,
    private readonly commitListCalculator: CommitListCalculator,
    private readonly outputProvider: IOutputProvider,
    private readonly resultSetter: IResultSetter,
  ) {}

  public async run(): Promise<void> {
    try {
      const commitRefRange = await this.commitRefRangeCalculator.execute()
      const commits = await this.commitListCalculator.execute(commitRefRange)
      const { currentRef } = commitRefRange
      const output = await this.outputProvider.execute(currentRef, commits)
      this.resultSetter.setOutput('changelog', output)
    } catch (error) {
      this.resultSetter.setFailed(error2Json(error))
    }
  }

  public async doSomething() {
    const shaToTagMap: Map<string, { isPrerelease: boolean; tag: string }> =
      new Map()
    const allCommits: Commit[] = []
    //const versionCommits: Commit[] = []
    const outputBuilder: IHistoryBuilder = new JsonHistoryBuilder()
    const includePrereleases = true
    // for (const commit of allCommits) {
    //   versionCommits.push(commit)
    //   const tag = shaToTagMap.get(commit.sha)
    //   if (tag) {
    //     if (!tag.isPrerelease || includePrereleases) {
    //       const outputItem = await this.outputProvider.execute(
    //         tag.tag,
    //         versionCommits,
    //       )
    //       outputBuilder.combine(outputItem)
    //     }
    //     if (!tag.isPrerelease) {
    //       versionCommits.length = 0
    //     }
    //   }
    // }

    // OPTIMIZED
    const conventionalProvider = new ConventionalProvider(
      getChangelogConfig(),
      new AutoLinkProvider(),
    )
    // NOTE: commitsInfos needs to be reversed.
    //const commitsInfos: CommitInfo[] = allCommits.map(x => toCommitInfo(x))
    const commitsInfos: readonly CommitInfo[] =
      await conventionalProvider.execute(allCommits)
    const versionCommits2: CommitInfo[] = []
    for (const commit of commitsInfos) {
      versionCommits2.push(commit)
      const tag = shaToTagMap.get(commit.sha)
      if (tag) {
        if (!tag.isPrerelease || includePrereleases) {
          const outputItem = await new ConventionalOutputProvider2().execute(
            tag.tag,
            versionCommits2,
          )
          //changelog += markdown
          outputBuilder.append(outputItem)
        }
        if (!tag.isPrerelease) {
          versionCommits2.length = 0
        }
      }
    }

    // REVERSE DRAFT
    const arr: CommitInfo[] = []
    let i = 0
    let current: CommitInfo
    do {
      arr.push(commitsInfos[i])
      i += 1
      if (i >= commitsInfos.length) {
        break
      }
      const current = commitsInfos[i]
      const tagObj = shaToTagMap.get(commitsInfos[i].sha)
      if (tagObj && !tagObj.isPrerelease) {
        break
      }
    } while (i < commitsInfos.length) {
    for (const commit of arr) {
      const tag = shaToTagMap.get(commit.sha)
      if (tag) {
        if (!tag.isPrerelease || includePrereleases) {
          const outputItem = await new ConventionalOutputProvider2().execute(
            tag.tag,
            arr,
          )
          outputBuilder.append(outputItem)
        }
      }
      arr.pop()
    }

    //return changelog
    return outputBuilder.build()
  }
}

interface IHistoryBuilder {
  append(value: string): string
  build(): string
}
class JsonHistoryBuilder implements IHistoryBuilder {
  append(value: string): string {
    throw new Error('Method not implemented.')
  }
  build(): string {
    throw new Error('Method not implemented.')
  }
}
class TextHistoryBuilder implements IHistoryBuilder {
  append(value: string): string {
    throw new Error('Method not implemented.')
  }
  build(): string {
    throw new Error('Method not implemented.')
  }
}
