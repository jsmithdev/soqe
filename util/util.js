
const path = require('path')
const util = require('util')

const fs = require('fs-extra')

const exec = util.promisify(require('child_process').exec)


const {
	toast,
} = require('./toast');



/**
 * Better error messages
 * @param {Object} stdout - object containing error's stdout resulting from the command
 * @returns {String} - prettier error message
 */
function prettyError(stdout){

    const m = stdout.message
    const noIndex = m.indexOf('No such column')

    if(noIndex){
        return `${stdout.name}: ${m.substring(noIndex, m.indexOf('. '))}`
    }

    return `${stdout.name}: ${m.substring(0, 100)}`
}


module.exports = {

    /**
     * 
     * @description remove all files from .soql directory
     * @param {String} directory to remove children
     */
    clearDirectory: async (directory) => {
        
        try {
            
            const files = await fs.readdir(directory)

            const getPath = file => path.join(directory, file)

            files.map(file => fs.remove(getPath(file), error => error ? toast(error.message, 'error') : toast('Cleared .soql', 'status')))
        }
        catch (error) {
            toast( error.message, 'error' )
        }
    },

    /**
     * 
     * @param {String} path to ensure exists
     */
    ensureDirectory: async (path) => {
        
        try {
            return fs.ensureDir(path)
        }
        catch (error) {
            toast( error.message, 'error' )
        }
    },


    getUserName: async (path) => {
        
        try {

            const file = `${path}/.sfdx/sfdx-config.json`

            const data = (await fs.readFile(file)).toString()

            const { defaultusername } = JSON.parse( data )

            return defaultusername
        }
        catch (error) {
            toast( error.message, 'error' )
        }
    },


    readJsonFile: async (path) => {

        try {

            const packageObj = await fs.readJson(path)

            return packageObj
        }
        catch (error) {
            toast(error.message, 'error')
        }
    },


    execute: async (cmd) => {
        try {

            const { stdout, stderr } = await exec( cmd )

            if(stderr){
                console.log(stderr)
                return toast(stderr, 'error')
            }
            
            return stdout
        }
        catch (error) {

            const stdout = JSON.parse(error.stdout)

            toast(prettyError(stdout), 'error') // should contain code (exit code) and signal (that caused the termination)
        }
    },

    /**
     * 
     * @param {Object} record - record of sobject from Salesforce 
     * @param {Array} columns - optional build columns array at same time to not repeat
     */
    flatten_record(record, columns) {

        if( typeof record !== 'object' || record == null ){
            return 
        }

        return Object.keys(record)
        .filter(key => key !== 'attributes')
        .reduce((acc, key) => {
            
            const value = record[key]
            
            if(typeof value !== 'object'){
                
                acc[key] = value 

                if(columns){ columns.push(key) }
                return acc
            }
            else {

                const record = value

                if( record == null ){
                    return 
                }
                
                acc[key] = Object.keys(record)
                .filter(key => key !== 'attributes')
                .reduce((acc, _key) => {
                    
                    const value = record[_key]
                    
                    if(typeof value !== 'object'){
                        
                        acc[_key] = value

                        if(columns){ columns.push(`${key}.${_key}`) }
                        return acc
                    }
                    else {

                        const record = value
                        
                        acc[_key] = Object.keys(record)
                        .filter(key => key !== 'attributes')
                        .reduce((acc, __key) => {

                            
                            const value = record[__key]
                            
                            if(typeof value !== 'object'){
                                
                                acc[__key] = value
            
                                if(columns){ columns.push(`${key}.${_key}.${__key}`) }
                                return acc
                            }
                            else {

                                const record = value
                                
                                acc[__key] = Object.keys(record)
                                .filter(key => key !== 'attributes')
                                .reduce((acc, ___key) => {
                                    
                                    const value = record[___key]
                                    
                                    if(typeof value !== 'object'){
                                        
                                        acc[___key] = value
                                        if(columns){ columns.push(`${key}.${_key}.${__key}.${___key}`) }
                                        return acc
                                    }
                                    else {

                                        const record = value
                                        
                                        acc[key] = Object.keys(record)
                                        .filter(key => key !== 'attributes')
                                        .reduce((acc, ____key) => {
                                            
                                            const value = record[____key]
                                            
                                            if(typeof value !== 'object'){
                                                
                                                acc[____key] = value

                                                if(columns){ columns.push(`${key}.${_key}.${__key}.${___key}.${____key}`) }
                                                return acc
                                            }
                                            else {
                                                console.error('SOQE: SOQL has traverse limit; Please open issue if hit.')
                                            }
                                            
                                            return acc
                                        }, {});
                                    }
                    
                                    return acc
                                }, {});
                            }
            
                            return acc
                        }, {});
                    }

                    return acc
                }, {});
            }

            return acc
        }, {});
    },
}