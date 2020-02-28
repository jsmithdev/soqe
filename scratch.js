
	const cache = { columns: [] }

    const records = []
    

    

	records.map(record => {

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