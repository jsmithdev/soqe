const util = require('util');
const exec = util.promisify(require('child_process').exec);

const vscode = require('vscode')
const fs = require('fs-extra')

const {
	setStatusBarMessage,
	showInformationMessage,
} = vscode.window;


const WORKING_DIR = `${vscode.workspace.workspaceFolders[0].uri.fsPath}`



exports.activate = activate


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	const task = vscode.commands.registerCommand('extension.soql', async function () {

		const username = await getUserName()

		if(!username){
			return toast(`No defaultusername found in ${WORKING_DIR}/.sfdx/sfdx-config.json`, 'info')
		}

		const panel = vscode.window.createWebviewPanel(
			'soqlView',
			'SOQL View',
			vscode.ViewColumn.One,
			{
			  enableScripts: true,
			  retainContextWhenHidden: true,
			}
		);
	  
		panel.webview.html = getView()
	  
		// handle a query
		panel.webview.onDidReceiveMessage(async data => {
			
			const { query } = data //.replace(/\n/g, '').trim()

			if(!query){
				return toast('A valid SOQL query is required', 'info')
			}
			

			//todo clean_query; check & if need, remove line breaks, trim
			//console.log(query)

			const cmd = `sfdx force:data:soql:query --json -u ${username} -q "${query}" `

			const results = await execute(cmd)
			console.log('awaited execute results')
			console.log(results)

			panel.webview.postMessage(results)

			//save records to .soql
			const storage_path = `${WORKING_DIR}/.soql`

			const slug = {
				query,
				username,
				results,
			}

			if( !(await exists(storage_path)) ){
				await fs.mkdir(storage_path)
			}

			const file_path = `${storage_path}/data_${new Date().getTime()}.json`

			fs.writeFile(file_path, JSON.stringify(slug))
		})
	})

	context.subscriptions.push(task)
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}



async function getUserName(){
	
	try {

		const path = `${WORKING_DIR}/.sfdx/sfdx-config.json`

		const data = (await fs.readFile(path)).toString()

		const { defaultusername } = JSON.parse( data )

		return defaultusername
	}
	catch (error) {
		error( error )
	}
}

/**
 * 
 * @param {String} message lk 
 * @param {String} type 
 */
function toast( message, type ){
	
	if(type === 'error'){
		//todo
	}
	else if(type === 'status'){
		setStatusBarMessage(`ℹ️ SOQL: ${message}`)
	}
	else {
		showInformationMessage(message)
	}

	return undefined
}


async function execute(cmd) {
	try {

		const { stdout, stderr } = await exec( cmd )
		console.log('stdout:', stdout);
		console.log('stderr:', stderr);

		return stdout
	}
	catch (error) {
		console.error(error); // should contain code (exit code) and signal (that caused the termination)
	}
}

/**
 * 
 * @param {String} path -- to use to see if it exists
 */
async function exists(path) {

	const result = await fs.access(path)

	return result && result.code === 'ENOENT' ? false : true
}













function getView() {
return /* html */`
<html>

<style>
	div {
		text-align: center;
		padding: 5px;
  	}
	div.editor {
		padding-top: 1rem;
	}
	textarea {
		width: 80%;
		height: 15rem;
		text-align: left;
	}
	button {
		cursor: pointer;
		margin: .8rem;
		border-radius: 5px;
	}
</style>

<body>

	<div class="editor">
		<textarea
			autocomplete="on"
			id="soql"
		>select id, name, account.name, account.createdby.name from contact limit 2</textarea>
	</div>

	<div>
		<button 
			type="button" 
			id="query">
			  Query
		</button>
	</div>

	<div style="border-bottom: 2px solid #ec00ff; padding: 5px"></div>

	<div>
		<b>Total Size: </b><span id="current_totalSize"></span>
	</div>
	<div>
		<b>Current Query: </b>
		<span id="current_query"></span>
	</div>
	<div id="results">
		<table>
			<thead></thead>
			<tbody></tbody>
		</table>
	</div>
</body>

<script>

const vscode = acquireVsCodeApi()

const dom = {
	current_query: document.getElementById('current_query'),
	results: document.getElementById('results'),
	soql: document.getElementById('soql'),
	query: document.getElementById('query'),
	current_totalSize: document.getElementById('current_totalSize'),
	thead: document.querySelector('thead'),
	tbody: document.querySelector('tbody'),
}

const cache = {
	get query(){
		return this._query
	},
	set query(new_query){
		this._query = new_query
		dom.current_query.textContent = new_query
	},
	get totalSize(){
		return this._totalSize
	},
	set totalSize(totalSize){
		this._totalSize = totalSize
		dom.current_totalSize.textContent = totalSize
	},
}



dom.query.onclick = event => executeQuery(dom.soql.value)


window.addEventListener('message', event => {

	const { data } = event

	const {
		done,
		records,
		totalSize,
	} = JSON.parse( data ).result;

	cache.totalSize = totalSize

	setupTable( records )
})


function executeQuery(query) {

	cache.query = query

	vscode.postMessage({ query })
}


function setupTable(records){

	const cache = { columns: [] }

	clearTable()

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

			uniques.map(col => {
				
				const th = document.createElement('th')
				th.textContent = col
				dom.thead.appendChild(th)
				
				cache.columns = [...cache.columns, col]
			})
		}


		const values = cache.columns.map(key => {

			if( record[key] ){
				return record[key]
			}

			console.log(key)

			const data = key.split(' ')

			// nested child
			if(data.length === 2){
				return record[ data[0] ][ data[1] ]
			}
			// nested nested child
			if(data.length === 3){

				return record[ data[0] ][ data[1] ][ data[2] ]
			}
		})

		const tr = document.createElement('tr')

		values.map(value => {

			const td = document.createElement('td')
			td.textContent = value
			tr.appendChild(td)
		})

		dom.tbody.appendChild(tr)
  })
}

function clearTable(){
	
	while (dom.thead.lastElementChild) {
		dom.thead.removeChild(dom.thead.lastElementChild);
	}
	while (dom.tbody.lastElementChild) {
		dom.tbody.removeChild(dom.tbody.lastElementChild);
	}
	return undefined
}

</script>
</html>
`
}