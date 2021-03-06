import { expect } from 'chai'
import nock from 'nock'
import * as github from '@actions/github'
import { ActionContext } from '../../../src/contracts/types'
import WorkflowShaProvider from '../../../src/helpers/workflowShaProvider'

describe('WorkflowShaProvider', () => {
  context('listWorflowRuns returns 1 workflow', () => {
    it('return expected sha', async () => {
      const branchName = 'my-branch'
      const workflowId = 45
      const octokit = github.getOctokit('abc123')
      const context: ActionContext = {
        owner: 'colt',
        ref: 'refs/heads/main',
        repo: 'Changelogger',
        runId: 2,
      }
      const commitRefValidator = async (commitRef: string) => {
        return
      }

      const scoped = nock('https://api.github.com')
        .get(
          `/repos/${context.owner}/${context.repo}/actions/workflows/${workflowId}/runs?branch=${branchName}&status=success&per_page=1&page=1`,
        )
        .reply(200, {
          total_count: 1,
          workflow_runs: [{ head_sha: 'xyz1234' }],
        })

      // Act
      const sut = new WorkflowShaProvider(octokit, context, commitRefValidator)

      // Assert
      const actual = await sut.execute(branchName, workflowId)
      const expected = 'xyz1234'
      expect(actual).to.equal(expected)
    })
  })

  context(
    'listWorflowRuns returns 2 workflows; first sha does not exist',
    () => {
      it('return second sha', async () => {
        const branchName = 'my-branch'
        const workflowId = 45
        const octokit = github.getOctokit('abc123')
        const context: ActionContext = {
          owner: 'colt',
          ref: 'refs/heads/main',
          repo: 'Changelogger',
          runId: 2,
        }
        const firstSha = 'xyz1234'
        const secondSha = '1234xyz'
        const commitRefValidator = async (commitRef: string) => {
          if (commitRef === firstSha) {
            throw new Error()
          }
          return
        }

        nock('https://api.github.com')
          .get(
            `/repos/${context.owner}/${context.repo}/actions/workflows/${workflowId}/runs?branch=${branchName}&status=success&per_page=1&page=1`,
          )
          .reply(200, {
            total_count: 1,
            workflow_runs: [{ head_sha: firstSha }],
          })
        nock('https://api.github.com')
          .get(
            `/repos/${context.owner}/${context.repo}/actions/workflows/${workflowId}/runs?branch=${branchName}&status=success&per_page=1&page=2`,
          )
          .reply(200, {
            total_count: 1,
            workflow_runs: [{ head_sha: secondSha }],
          })

        const sut = new WorkflowShaProvider(
          octokit,
          context,
          commitRefValidator,
        )

        // Act
        const actual = await sut.execute(branchName, workflowId)

        // Assert
        const expected = secondSha
        expect(actual).to.equal(expected)
      })
    },
  )

  context('listWorflowRuns returns 0 workflows', () => {
    it('return expected sha', async () => {
      const branchName = 'my-branch'
      const workflowId = 45
      const octokit = github.getOctokit('abc123')
      const context: ActionContext = {
        owner: 'colt',
        ref: 'refs/heads/main',
        repo: 'Changelogger',
        runId: 2,
      }
      const commitRefValidator = async (commitRef: string) => {
        return
      }

      const scoped = nock('https://api.github.com')
        .get(
          `/repos/${context.owner}/${context.repo}/actions/workflows/${workflowId}/runs?branch=${branchName}&status=success&per_page=1&page=1`,
        )
        .reply(200, { total_count: 0, workflow_runs: [] })

      // Act
      const sut = new WorkflowShaProvider(octokit, context, commitRefValidator)

      // Assert
      const actual = await sut.execute(branchName, workflowId)
      const expected = undefined
      expect(actual).to.equal(expected)
    })
  })
})
