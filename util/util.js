
module.exports = {

    /**
     * 
     * @param {Object} record - record of sobject from Salesforce 
     * @param {Array} columns - optional build columns array at same time to not repeat
     */
    flatten_record(record, columns) {

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
                                                console.error('SOQE LIMIT: SOQL LIMIT is 4 traverses')
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

