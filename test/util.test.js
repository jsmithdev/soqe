/* eslint-disable no-undef */
const path = require('path')

const {
	execute,
	getUserName,
	readJsonFile,
	flatten_record,
	clearDirectory,
	ensureDirectory,
} = require('./../util/util');


const {
    records,
} = require('./test_sfdx_soql').result;



it('clearDirectory: path used test/mock/empty', async () => {
    const response = await clearDirectory(path.join(__dirname+'/mock/empty'))
    expect(
        response
    ).toBe(undefined)
})



it('ensureDirectory: path used test/mock/.sfdx/sfdx-config.json', async () => {
    const error = await ensureDirectory(path.join(__dirname+'/mock/'))
    expect(
        error
    ).toBe(null)
})


it('readJsonFile: path used test/mock/.sfdx/sfdx-config.json', async () => {
    const response = await readJsonFile(path.join(__dirname+'/mock/.sfdx/sfdx-config.json'))
    expect(
        response
    ).toEqual(
        {"defaultusername": "me@jsmith.dev"}
    )
})


it('getUserName: path used test/mock', async () => {
    const response = await getUserName(path.join(__dirname+'/mock'))
    expect(
        response
    ).toContain(
        'me@jsmith.dev'
    )
})


it('execute: exec `echo hello`', async () => {
    const response = await execute('echo hello')
    expect(
        response
    ).toContain(
        'hello'
    )
})


it('execute: exec `echo hello`', async () => {
    const response = await execute('echo hello')
    expect(
        response
    ).toContain(
        'hello'
    )
})


it('flatten_record: Run with no columns', () => {
    expect(
        Array.isArray(records.map(record => flatten_record(record, null)))
    ).toBe(
        true
    )
})


it('flatten_record: Check cleaned attributes', () => {

    const processed = records.map(record => flatten_record(record, null))
    
    const result = Object.keys(processed).find(key => key === 'attributes')

    expect(result).toBe(undefined)
})


it('flatten_record: Check cleaned attributes', () => {

    const processed = records.map(record => flatten_record(record, null))
    
    const result = Object.keys(processed).find(key => key === 'attributes')

    expect(result).toBe(undefined)
})