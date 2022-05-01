import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
const expect = chai.expect
import * as tsSinon from 'ts-sinon'
import { Substitute, Arg } from '@fluffy-spoon/substitute'
import { IOutputProvider, IResultSetter } from '../../src/contracts/interfaces'
import { Commit } from '../../src/contracts/types'
import GitHubAction from '../../src/githubAction'
import CommitListCalculator from '../../src/mainDependencies/commitListCalculator'
import CommitRefRangeCalculator from '../../src/mainDependencies/commitRefRangeCalculator'

describe('GitHubAction', () => {
  context('valid commitRefRange exists', () => {
    it('previousRef is 67671cd and currentRef is main', async () => {
      const commitRefRangeCalculator = tsSinon.stubConstructor(CommitRefRangeCalculator)
      const commitListCalculator = tsSinon.stubConstructor(CommitListCalculator)
      const outputProvider = tsSinon.stubInterface<IOutputProvider>()
      const resultSetter = Substitute.for<IResultSetter>()

      const commitRefRange = { previousRef: 'v0.1.0', currentRef: 'v0.2.0' }
      const commits: Commit[] = [
        { commitHash: 'abc1234', header: 'feat: my feature', rawBody: 'feat: my feature' },
      ]
      const markdown = '### Features\n\n• my feature'

      commitRefRangeCalculator.execute.resolves(commitRefRange)
      commitListCalculator.execute.withArgs(commitRefRange).resolves(commits)
      outputProvider.execute.withArgs(commits).resolves(markdown)

      const sut = new GitHubAction(
        commitRefRangeCalculator,
        commitListCalculator,
        outputProvider,
        resultSetter,
      )

      // Act
      await sut.run()

      // Assert
      resultSetter.received(1).setOutput('commit-list', markdown)
    })
  })

  context('context.ref is refs/heads/main', () => {
    it('previousRef is 67671cd and currentRef is main', async () => {
      const commitRefRangeCalculator = tsSinon.stubConstructor(CommitRefRangeCalculator)
      const commitListCalculator = tsSinon.stubConstructor(CommitListCalculator)
      const outputProvider = tsSinon.stubInterface<IOutputProvider>()
      const resultSetter = Substitute.for<IResultSetter>()

      const commitRefRange = { previousRef: 'v0.1.0', currentRef: 'v0.2.0' }
      const commits: Commit[] = [
        { commitHash: 'abc1234', header: 'feat: my feature', rawBody: 'feat: my feature' },
      ]
      const markdown = '### Features\n\n• my feature'

      commitRefRangeCalculator.execute.resolves(commitRefRange)
      commitListCalculator.execute.withArgs(commitRefRange).resolves(commits)
      outputProvider.execute.withArgs(commits).resolves(markdown)

      const sut = new GitHubAction(
        commitRefRangeCalculator,
        commitListCalculator,
        outputProvider,
        resultSetter,
      )

      // Act
      await sut.run()

      // Assert
      resultSetter.received(1).setOutput('commit-list', markdown)
    })
  })
})
