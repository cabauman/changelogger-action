import { expect } from 'chai'
import * as tsSinon from 'ts-sinon'
import nock from 'nock'
import * as github from '@actions/github'
import { ActionContext } from '../../../src/contracts/types'
import WorkflowIdProvider from '../../../src/helpers/workflowIdProvider'

describe('WorkflowIdProvider', () => {
  it('return expected workflow ID', async () => {
    const octokit = github.getOctokit('abc123')
    const context: ActionContext = {
      owner: 'colt',
      ref: 'refs/heads/main',
      repo: 'Changelogger',
      runId: 45,
    }

    const scoped = nock('https://api.github.com')
      .get(
        `/repos/${context.owner}/${context.repo}/actions/runs/${context.runId}`,
      )
      .reply(200, { workflow_id: 2 })

    // Act
    const sut = new WorkflowIdProvider(octokit, context)

    // Assert
    const actual = await sut.execute()
    const expected = 2
    expect(actual).to.equal(expected)
  })
})
