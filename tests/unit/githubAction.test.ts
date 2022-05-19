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
  context('previousRef is v0.1.0 and currentRef is v0.2.0', () => {
    it('resultSetter.setOutput is called once with expected markdown', async () => {
      const commitRefRangeCalculator = tsSinon.stubConstructor(CommitRefRangeCalculator)
      const commitListCalculator = tsSinon.stubConstructor(CommitListCalculator)
      const outputProvider = tsSinon.stubInterface<IOutputProvider>()
      const resultSetter = Substitute.for<IResultSetter>()

      const commitRefRange = { previousRef: 'v0.1.0', currentRef: 'v0.2.0' }
      const commits: Commit[] = [
        { sha: 'abc1234', header: 'feat: my feature', rawBody: 'feat: my feature' },
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

  context('previousRef is undefined and currentRef is v0.2.0', () => {
    it('resultSetter.setOutput is called once with failure message', async () => {
      const commitRefRangeCalculator = tsSinon.stubConstructor(CommitRefRangeCalculator)
      const commitListCalculator = tsSinon.stubConstructor(CommitListCalculator)
      const outputProvider = tsSinon.stubInterface<IOutputProvider>()
      const resultSetter = Substitute.for<IResultSetter>()

      const commitRefRange = { previousRef: undefined, currentRef: 'v0.2.0' }

      commitRefRangeCalculator.execute.resolves(commitRefRange)

      const sut = new GitHubAction(
        commitRefRangeCalculator,
        commitListCalculator,
        outputProvider,
        resultSetter,
      )

      // Act
      await sut.run()

      // Assert
      resultSetter.received(1).setOutput('commit-list', 'No previous commits to compare to.')
    })
  })

  context('commitRefRangeCalculator throws an error', () => {
    it('resultSetter.setFailed is called once with failure message', async () => {
      const commitRefRangeCalculator = tsSinon.stubConstructor(CommitRefRangeCalculator)
      const commitListCalculator = tsSinon.stubConstructor(CommitListCalculator)
      const outputProvider = tsSinon.stubInterface<IOutputProvider>()
      const resultSetter = Substitute.for<IResultSetter>()

      commitRefRangeCalculator.execute.rejects(new Error('oops'))

      const sut = new GitHubAction(
        commitRefRangeCalculator,
        commitListCalculator,
        outputProvider,
        resultSetter,
      )

      // Act
      await sut.run()

      // Assert
      resultSetter.received(1).setFailed('{"name":"Error","message":"oops"}')
    })
  })
})
