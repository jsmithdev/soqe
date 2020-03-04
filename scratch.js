







const fs = require('fs-extra')
const path = require('path')

const WORKING_DIR = __dirname

readStorage()
async function readStorage(){

	const storage_path = path.join(WORKING_DIR, '.soql')

	const files = await fs.readdir(storage_path)

	files.map(file => readJson(path.join(storage_path, file)))
}

// With async/await:
async function readJson (path) {
	try {
	  const packageObj = await fs.readJson(path)
  
	  console.log(packageObj)
	  return packageObj
	} catch (err) {
	  console.error(err)
	}
}








function testing_(){

	const cache = { columns: [] }

	const {records} = mockSOQL().result

	const columns = []



	const cleaned = records.map(record => {
		if(columns.length === 0){
			return flatten_record(record, columns)
		}
		else {
			// @ts-ignore
			return flatten_record(record)
		}
	})

	function flatten_values(obj){
		return Object.values(obj).reduce((acc, value) => {
			
			if(typeof value !== 'object'){
				return [...acc, value]
			}
			else {
				return [...acc, ...flatten_values(value)]
			}
		}, [])
	}

}
/**
 * 
 * @param {Object} record - record of sobject from Salesforce 
 * @param {Array} columns - optional build columns array at same time to not repeat
 */
function flatten_record(record, columns) {

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
}






/* 

records.map(record => {
	record //?
	if(!cache.columns.length){

		const potentials = Object.keys(record).filter(item => item !== 'attributes')


		const uniques = potentials.reduce((acc, item, index) => {

			const isUnique = potentials.indexOf(item) === index

			if( isUnique ){
				
				const parent = potentials[index]
				const parent_value = record[item]

				if(typeof parent_value === 'object'){
					
					const child_potentials = Object.keys( parent_value ).filter(item => item !== 'attributes')

					const children = child_potentials.map(child => {

						const child_value = parent_value[child]

						if(typeof child_value === 'object'){
							
							const grand_child_potentials = Object.keys( child_value ).filter(item => item !== 'attributes')

							const grand_children = grand_child_potentials.map(grand_child => {

								const grand_child_value = parent_value[grand_child]
							
								if(typeof grand_child_value === 'object'){

									const great_grand_child = Object.keys( grand_child_value ).find(item => item !== 'attributes')
									// SOQL traverse limit
									return parent+' '+child+' '+grand_child+' '+great_grand_child
								}
								else{
									return parent+' '+child+' '+grand_child
								}
							})
						}
						else{
							return parent+' '+child
						}
						
					})
					
					acc = [ ...acc, ...children ]
				}
				else {
					acc = [ ...acc, parent ]
				}
			}

			return acc
		}, []);
	}
}) */




function mockSOQL(){

	return {
		"status": 0,
		"result": {
		  "totalSize": 2,
		  "done": true,
		  "records": [
			{
			  "attributes": {
				"type": "Contact",
				"url": "/services/data/v48.0/sobjects/Contact/0034P00002yLeB4QAK"
			  },
			  "Id": "0034P00002yLeB4QAK",
			  "Name": "Brian Donohue",
			  "Account": {
				"attributes": {
				  "type": "Account",
				  "url": "/services/data/v48.0/sobjects/Account/0014P00002U7nI8QAJ"
				},
				"Name": "7 Terry Ln  Blauvelt NY 109131515",
				"CreatedBy": {
				  "attributes": {
					"type": "User",
					"url": "/services/data/v48.0/sobjects/User/0054P00000BH2rxQAD"
				  },
				  "Name": "Data Integration",
				  "CreatedBy": {
					"attributes": {
					  "type": "User",
					  "url": "/services/data/v48.0/sobjects/User/0054P00000BH2rdQAD"
					},
					"Name": "Kerry Reitnauer"
				  }
				}
			  }
			},
			{
			  "attributes": {
				"type": "Contact",
				"url": "/services/data/v48.0/sobjects/Contact/0034P00002yLeB5QAK"
			  },
			  "Id": "0034P00002yLeB5QAK",
			  "Name": "Betty Sigismonti",
			  "Account": {
				"attributes": {
				  "type": "Account",
				  "url": "/services/data/v48.0/sobjects/Account/0014P00002Wj5zMQAR"
				},
				"Name": "20 Cypress St  Floral Park NY 110013406",
				"CreatedBy": {
				  "attributes": {
					"type": "User",
					"url": "/services/data/v48.0/sobjects/User/0054P00000BH2rxQAD"
				  },
				  "Name": "Data Integration",
				  "CreatedBy": {
					"attributes": {
					  "type": "User",
					  "url": "/services/data/v48.0/sobjects/User/0054P00000BH2rdQAD"
					},
					"Name": "Kerry Reitnauer"
				  }
				}
			  }
			}
		  ]
		}
	  }
}