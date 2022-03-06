import * as github from '@actions/github'
import { IActionContext } from './interfaces'

export default function getContext(): IActionContext {
  return {
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ref: github.context.ref,
    runId: github.context.runId,
  }
}
