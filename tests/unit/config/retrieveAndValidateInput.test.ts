import { expect } from 'chai'
import * as tsSinon from 'ts-sinon'
import retrieveAndValidateInput, {
  BRANCH_COMPARISON_STRATEGY,
  SUPPORTED_OUTPUT_FLAVORS,
} from '../../../src/config/getInput'
import { IInputRetriever } from '../../../src/contracts/interfaces'
import { ActionInput } from '../../../src/contracts/types'

describe('retrieveAndValidateInput', () => {
  it('returns expected input', () => {
    const sut = retrieveAndValidateInput
    const inputRetriever = tsSinon.stubInterface<IInputRetriever>()
    // TODO: make the input keys constants.
    inputRetriever.getBooleanInput.withArgs('is-conventional').returns(true)
    inputRetriever.getInput.withArgs('output-flavor').returns('github-release')
    inputRetriever.getInput.withArgs('preamble').returns('Commit list:')
    inputRetriever.getInput.withArgs('token').returns('my-token')
    inputRetriever.getInput.withArgs(BRANCH_COMPARISON_STRATEGY).returns('tag')
    const actual = sut(inputRetriever)
    const expected: ActionInput = {
      isConventional: true,
      outputFlavor: 'github-release',
      preamble: 'Commit list:',
      token: 'my-token',
      branchComparisonStrategy: 'tag',
    }
    expect(actual).to.deep.equal(expected)
  })

  context(`output-flavor value is 'html'`, () => {
    it('throws invalid value error for output-flavor', () => {
      const sut = retrieveAndValidateInput
      const inputRetriever = tsSinon.stubInterface<IInputRetriever>()
      inputRetriever.getBooleanInput.withArgs('is-conventional').returns(true)
      inputRetriever.getInput.withArgs('output-flavor').returns('html')
      inputRetriever.getInput.withArgs('preamble').returns('Commit list:')
      inputRetriever.getInput.withArgs('token').returns('my-token')
      expect(() => sut(inputRetriever))
        .to.throw()
        .with.property(
          'message',
          `Invalid value 'html' for 'output-flavor' input. It must be one of ${SUPPORTED_OUTPUT_FLAVORS}`,
        )
    })
  })

  context(`token is falsy`, () => {
    it('throws invalid value error for token', () => {
      const sut = retrieveAndValidateInput
      const inputRetriever = tsSinon.stubInterface<IInputRetriever>()
      inputRetriever.getBooleanInput.withArgs('is-conventional').returns(true)
      inputRetriever.getInput.withArgs('output-flavor').returns('github-release')
      inputRetriever.getInput.withArgs('preamble').returns('Commit list:')
      inputRetriever.getInput.withArgs('token').returns('')
      expect(() => sut(inputRetriever))
        .to.throw()
        .with.property('message', `Invalid value '' for 'token' input.`)
    })
  })
})
