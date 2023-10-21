import { expect } from 'chai'
import * as tsSinon from 'ts-sinon'
import retrieveAndValidateInput, {
  BRANCH_COMPARISON_STRATEGY,
  IS_CONVENTIONAL,
  OUTPUT_FLAVOR,
  PREAMBLE,
  SUPPORTED_OUTPUT_FLAVORS,
  TOKEN,
  AGGREGATE_PRERELEASES,
} from '../../../src/config/getInput'
import { IInputRetriever } from '../../../src/contracts/interfaces'
import { ActionInput } from '../../../src/contracts/types'

describe('retrieveAndValidateInput', () => {
  it('returns expected input', () => {
    const sut = retrieveAndValidateInput
    const inputRetriever = tsSinon.stubInterface<IInputRetriever>()
    inputRetriever.getBooleanInput.withArgs(IS_CONVENTIONAL).returns(true)
    inputRetriever.getInput.withArgs(OUTPUT_FLAVOR).returns('github-release')
    inputRetriever.getInput.withArgs(PREAMBLE).returns('Commit list:')
    inputRetriever.getInput.withArgs(TOKEN).returns('my-token')
    inputRetriever.getInput.withArgs(BRANCH_COMPARISON_STRATEGY).returns('tag')
    inputRetriever.getBooleanInput.withArgs(AGGREGATE_PRERELEASES).returns(true)
    const actual = sut(inputRetriever)
    const expected: ActionInput = {
      isConventional: true,
      outputFlavor: 'github-release',
      preamble: 'Commit list:',
      token: 'my-token',
      branchComparisonStrategy: 'tag',
      aggregatePrereleases: true,
    }
    expect(actual).to.deep.equal(expected)
  })

  context(`${OUTPUT_FLAVOR} value is 'html'`, () => {
    it(`throws invalid ${OUTPUT_FLAVOR} value error`, () => {
      const sut = retrieveAndValidateInput
      const inputRetriever = tsSinon.stubInterface<IInputRetriever>()
      inputRetriever.getBooleanInput.withArgs(IS_CONVENTIONAL).returns(true)
      inputRetriever.getInput.withArgs(OUTPUT_FLAVOR).returns('html')
      inputRetriever.getInput.withArgs(PREAMBLE).returns('Commit list:')
      inputRetriever.getInput.withArgs(TOKEN).returns('my-token')
      expect(() => sut(inputRetriever))
        .to.throw()
        .with.property(
          'message',
          `Invalid value 'html' for ${OUTPUT_FLAVOR} input. It must be one of ${SUPPORTED_OUTPUT_FLAVORS}`,
        )
    })
  })

  context(`token is falsy`, () => {
    it('throws invalid value error for token', () => {
      const sut = retrieveAndValidateInput
      const inputRetriever = tsSinon.stubInterface<IInputRetriever>()
      inputRetriever.getBooleanInput.withArgs(IS_CONVENTIONAL).returns(true)
      inputRetriever.getInput.withArgs(OUTPUT_FLAVOR).returns('github-release')
      inputRetriever.getInput.withArgs(PREAMBLE).returns('Commit list:')
      inputRetriever.getInput.withArgs(TOKEN).returns('')
      expect(() => sut(inputRetriever))
        .to.throw()
        .with.property('message', `Invalid value '' for 'token' input.`)
    })
  })
})
