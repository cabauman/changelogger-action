import { expect } from 'chai'
import * as tsSinon from 'ts-sinon'
import retrieveAndValidateInput, {
  BRANCH_COMPARISON_STRATEGY,
  SUPPORTED_MARKDOWN_FLAVORS,
} from '../../../src/config/getInput'
import { IInputRetriever } from '../../../src/contracts/interfaces'
import { ActionInput } from '../../../src/contracts/types'

describe('retrieveAndValidateInput', () => {
  it('returns expected input', () => {
    const sut = retrieveAndValidateInput
    const inputRetriever = tsSinon.stubInterface<IInputRetriever>()
    // TODO: make the input keys constants.
    inputRetriever.getBooleanInput.withArgs('is-conventional').returns(true)
    inputRetriever.getInput.withArgs('markdown-flavor').returns('github')
    inputRetriever.getInput.withArgs('preamble').returns('Commit list:')
    inputRetriever.getInput.withArgs('token').returns('my-token')
    inputRetriever.getInput.withArgs(BRANCH_COMPARISON_STRATEGY).returns('tag')
    const actual = sut(inputRetriever)
    const expected: ActionInput = {
      isConventional: true,
      markdownFlavor: 'github',
      preamble: 'Commit list:',
      token: 'my-token',
      branchComparisonStrategy: 'tag',
    }
    expect(actual).to.deep.equal(expected)
  })

  context(`markdown-flavor value is 'html'`, () => {
    it('throws invalid value error for markdown-flavor', () => {
      const sut = retrieveAndValidateInput
      const inputRetriever = tsSinon.stubInterface<IInputRetriever>()
      inputRetriever.getBooleanInput.withArgs('is-conventional').returns(true)
      inputRetriever.getInput.withArgs('markdown-flavor').returns('html')
      inputRetriever.getInput.withArgs('preamble').returns('Commit list:')
      inputRetriever.getInput.withArgs('token').returns('my-token')
      expect(() => sut(inputRetriever))
        .to.throw()
        .with.property(
          'message',
          `Invalid value 'html' for 'markdown-flavor' input. It must be one of ${SUPPORTED_MARKDOWN_FLAVORS}`,
        )
    })
  })

  context(`token is falsy`, () => {
    it('throws invalid value error for token', () => {
      const sut = retrieveAndValidateInput
      const inputRetriever = tsSinon.stubInterface<IInputRetriever>()
      inputRetriever.getBooleanInput.withArgs('is-conventional').returns(true)
      inputRetriever.getInput.withArgs('markdown-flavor').returns('github')
      inputRetriever.getInput.withArgs('preamble').returns('Commit list:')
      inputRetriever.getInput.withArgs('token').returns('')
      expect(() => sut(inputRetriever))
        .to.throw()
        .with.property('message', `Invalid value '' for 'token' input.`)
    })
  })
})
