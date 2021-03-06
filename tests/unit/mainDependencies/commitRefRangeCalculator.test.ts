import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
const expect = chai.expect
import * as tsSinon from 'ts-sinon'
import { ActionContext, CommitRefRange } from '../../../src/contracts/types'
import CommitHashCalculator from '../../../src/helpers/commitHashCalculator'
import CommitRefRangeCalculator from '../../../src/mainDependencies/commitRefRangeCalculator'

describe('CommitRefRangeCalculator', () => {
  context('context.ref is refs/heads/main', () => {
    it('previousRef is 67671cd and currentRef is main', async () => {
      const context: ActionContext = {
        owner: 'colt',
        ref: 'refs/heads/main',
        repo: 'Changelogger',
        runId: 1,
      }
      const branchComparisonStrategy = 'workflow'
      const { ref: githubRef } = context
      const commitHashCalculator = tsSinon.stubConstructor(CommitHashCalculator)
      const previousTagProvider = (currentTag: string) => {
        return Promise.resolve('v0.1.0')
      }

      commitHashCalculator.execute.withArgs('main').resolves('67671cd')

      const sut = new CommitRefRangeCalculator(
        { githubRef, branchComparisonStrategy },
        commitHashCalculator,
        previousTagProvider,
      )

      // Act
      const actual = await sut.execute()

      const expected: CommitRefRange = {
        previousRef: '67671cd',
        currentRef: 'main',
      }
      expect(actual).to.deep.equal(expected)
    })

    context('commitHashCalculator returns undefined', () => {
      it('previousRef is undefined and currentRef is main', async () => {
        const context: ActionContext = {
          owner: 'colt',
          ref: 'refs/heads/main',
          repo: 'Changelogger',
          runId: 1,
        }
        const branchComparisonStrategy = 'workflow'
        const { ref: githubRef } = context
        const commitHashCalculator =
          tsSinon.stubConstructor(CommitHashCalculator)
        const previousTagProvider = (currentTag: string) => {
          return Promise.resolve('v0.1.0')
        }

        commitHashCalculator.execute.withArgs('main').resolves(undefined)

        const sut = new CommitRefRangeCalculator(
          { githubRef, branchComparisonStrategy },
          commitHashCalculator,
          previousTagProvider,
        )

        // Act
        const actual = await sut.execute()

        const expected: CommitRefRange = {
          previousRef: undefined,
          currentRef: 'main',
        }
        expect(actual).to.deep.equal(expected)
      })
    })
  })

  context('context.ref is refs/tags/v0.2.0', () => {
    it('previousRef is v0.1.0 and currentRef is v0.2.0', async () => {
      const context: ActionContext = {
        owner: 'colt',
        ref: 'refs/tags/v0.2.0',
        repo: 'Changelogger',
        runId: 1,
      }
      const branchComparisonStrategy = 'workflow'
      const { ref: githubRef } = context
      const commitHashCalculator = tsSinon.stubConstructor(CommitHashCalculator)
      const previousTagProvider = (currentTag: string) => {
        return Promise.resolve('v0.1.0')
      }

      commitHashCalculator.execute.rejects(
        'This was not supposed to be called.',
      )

      const sut = new CommitRefRangeCalculator(
        { githubRef, branchComparisonStrategy },
        commitHashCalculator,
        previousTagProvider,
      )

      // Act
      const actual = await sut.execute()

      const expected: CommitRefRange = {
        previousRef: 'v0.1.0',
        currentRef: 'v0.2.0',
      }
      expect(actual).to.deep.equal(expected)
    })

    context(
      'previousTagProvider retuns current tag (because no earlier tags were found)',
      () => {
        it('previousRef is undefined and currentRef is v0.2.0', async () => {
          const context: ActionContext = {
            owner: 'colt',
            ref: 'refs/tags/v0.2.0',
            repo: 'Changelogger',
            runId: 1,
          }
          const branchComparisonStrategy = 'workflow'
          const { ref: githubRef } = context
          const commitHashCalculator =
            tsSinon.stubConstructor(CommitHashCalculator)
          const previousTagProvider = (currentTag: string) => {
            return Promise.resolve(currentTag)
          }

          commitHashCalculator.execute.rejects(
            'This was not supposed to be called.',
          )

          const sut = new CommitRefRangeCalculator(
            { githubRef, branchComparisonStrategy },
            commitHashCalculator,
            previousTagProvider,
          )

          // Act
          const actual = await sut.execute()

          const expected: CommitRefRange = {
            previousRef: 'v0.2.0',
            currentRef: 'v0.2.0',
          }
          expect(actual).to.deep.equal(expected)
        })
      },
    )
  })

  context('context.ref is something unsupported: refs/pull/1', () => {
    it('throws an error', async () => {
      const context: ActionContext = {
        owner: 'colt',
        ref: 'refs/pull/1',
        repo: 'Changelogger',
        runId: 1,
      }
      const branchComparisonStrategy = 'workflow'
      const { ref: githubRef } = context
      const commitHashCalculator = tsSinon.stubConstructor(CommitHashCalculator)
      const previousTagProvider = (currentTag: string) => {
        return Promise.resolve('v0.1.0')
      }

      commitHashCalculator.execute.rejects(
        'This was not supposed to be called.',
      )

      const sut = new CommitRefRangeCalculator(
        { githubRef, branchComparisonStrategy },
        commitHashCalculator,
        previousTagProvider,
      )

      // Act
      const fn = () => sut.execute()

      await expect(fn()).to.rejectedWith(
        `Expected github.context.ref to start with refs/heads/ or refs/tags/ but instead was refs/pull/1`,
      )
    })
  })
})
