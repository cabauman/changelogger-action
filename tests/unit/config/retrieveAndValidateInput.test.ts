import { expect } from 'chai'
import * as tsSinon from 'ts-sinon'
import retrieveAndValidateInput, { SUPPORTED_MARKDOWN_FLAVORS } from '../../../src/config/getInput'
import { IInputRetriever } from '../../../src/contracts/interfaces'
import { ActionInput } from '../../../src/contracts/types'

describe('retrieveAndValidateInput', () => {
  it('returns expected input', () => {
    const sut = retrieveAndValidateInput
    const inputRetriever = tsSinon.stubInterface<IInputRetriever>()
    // TODO: make the input keys constants.
    inputRetriever.getBooleanInput.withArgs('is-conventional').returns(true)
    inputRetriever.getInput.withArgs('markdown-flavor').returns('github')
    inputRetriever.getInput.withArgs('max-commits').returns('10')
    inputRetriever.getInput.withArgs('preamble').returns('Commit list:')
    inputRetriever.getInput.withArgs('token').returns('my-token')
    const actual = sut(inputRetriever)
    const expected: ActionInput = {
      isConventional: true,
      markdownFlavor: 'github',
      maxCommits: '10',
      preamble: 'Commit list:',
      token: 'my-token',
    }
    expect(actual).to.deep.equal(expected)
  })

  context(`max-commits value is 'a'`, () => {
    it('throws invalid value error for max-commits', () => {
      const sut = retrieveAndValidateInput
      const inputRetriever = tsSinon.stubInterface<IInputRetriever>()
      inputRetriever.getBooleanInput.withArgs('is-conventional').returns(true)
      inputRetriever.getInput.withArgs('markdown-flavor').returns('github')
      inputRetriever.getInput.withArgs('max-commits').returns('a')
      inputRetriever.getInput.withArgs('preamble').returns('Commit list:')
      inputRetriever.getInput.withArgs('token').returns('my-token')
      expect(() => sut(inputRetriever)).to.throw(`Invalid value 'a' for 'max-commits' input.`)
    })
  })

  context(`markdown-flavor value is 'html'`, () => {
    it('throws invalid value error for markdown-flavor', () => {
      const sut = retrieveAndValidateInput
      const inputRetriever = tsSinon.stubInterface<IInputRetriever>()
      inputRetriever.getBooleanInput.withArgs('is-conventional').returns(true)
      inputRetriever.getInput.withArgs('markdown-flavor').returns('html')
      inputRetriever.getInput.withArgs('max-commits').returns('10')
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
      inputRetriever.getInput.withArgs('max-commits').returns('10')
      inputRetriever.getInput.withArgs('preamble').returns('Commit list:')
      inputRetriever.getInput.withArgs('token').returns('')
      expect(() => sut(inputRetriever))
        .to.throw()
        .with.property('message', `Invalid value '' for 'token' input.`)
    })
  })
})
