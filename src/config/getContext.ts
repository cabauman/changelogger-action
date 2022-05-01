import * as github from '@actions/github'
import { ActionContext } from '../contracts/types'

export default function getContext(): ActionContext {
  return {
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ref: github.context.ref,
    runId: github.context.runId,
  }
}
