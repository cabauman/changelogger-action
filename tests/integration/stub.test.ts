import { expect } from 'chai'
import * as tsSinon from 'ts-sinon'
import * as core from '@actions/core'
import * as github from '@actions/github'
import { ILogger } from '../../src/contracts/interfaces'
import CommitRefRangeCalculator from '../../src/mainDependencies/commitRefRangeCalculator'

class Dummy {
  constructor(private readonly logger: ILogger) {}
}

describe.skip('integration.stub', () => {
  it('1 + 2', () => {
    tsSinon.default.stub(core, 'info')
    //const testStub = tsSinon.stubObject<CommitRefRangeCalculator>(test, ['methodA'])
    //const testStub = tsSinon.stubObject<CommitRefRangeCalculator>(test, { method: "stubbed" })
    //expect(testStub.method()).to.equal('stubbed')

    const testStub = tsSinon.stubConstructor(CommitRefRangeCalculator)
    expect(testStub.execute()).to.be.undefined
    testStub.execute.resolves({ previousRef: 'a', currentRef: 'b' })
    expect(testStub.execute()).to.deep.equal({ previousRef: 'a', currentRef: 'b' })

    expect(1 + 2).to.equal(3)

    //const stub = tsSinon.stubInterface<typeof core>()
    const stub = tsSinon.stubInterface<ILogger>()
    const dummy = new Dummy(stub)
    expect(stub.info('hello')).to.be.undefined
    // const x: IResultSetter = core
    // x.setFailed('')
    // x.setOutput('', '')
    // const y: ILogger = core
    // y.info('')
    // y.error('')
  })
})
