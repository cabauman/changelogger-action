import { ILinkProvider } from '../contracts/interfaces'

export class AutoLinkProvider implements ILinkProvider {
  public getShaLink(sha: string): string {
    return sha
  }
}
