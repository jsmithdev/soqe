const util = require('util');
const exec = util.promisify(require('child_process').exec);

const vscode = require('vscode')
const fs = require('fs-extra')
const path = require('path')

const {
	flatten_record,
} = require('./util/util');

const {
	setStatusBarMessage,
	showInformationMessage,
} = vscode.window;


const WORKING_DIR = `${vscode.workspace.workspaceFolders[0].uri.fsPath}`
const STORAGE_PATH = `${WORKING_DIR}/.soql`
ensureStore( STORAGE_PATH )


exports.activate = activate
module.exports = {
	activate,
}


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
			
			if(data.type === 'query'){
					
				const query = data.query.replace(/\n/g, '').trim()

				if(!query){
					return toast('A valid SOQL query is required', 'info')
				}
				

				const cmd = `sfdx force:data:soql:query --json -u ${username} -q "${query}" `

				const results = await execute(cmd)
				if(!results){ return }

				const response = JSON.parse(results)

				const { result } = response

				result.columns = []

				result.records = result.records.map(record => {

					if(result.columns.length === 0){
						return flatten_record(record, result.columns)
					}
					else {
						// @ts-ignore
						return flatten_record(record)
					}
				})

				const timestamp = new Date().getTime()

				const file_path = `${STORAGE_PATH}/${timestamp}.json`

				result.timestamp = timestamp
				result.query = query
				result.username = username
				
				// if want to save 
				if(data.store === true){
					fs.writeJson(file_path, result)
				}

				panel.webview.postMessage(result)
			}
			else if(data.type === 'delete_all'){
						
				clearDirectory()
			}
			else if(data.type === 'back'){
				console.log('BACK')		
				const storage_path = path.join(WORKING_DIR, '.soql')

				const files = await fs.readdir(storage_path)
				console.log(files)
				console.log(data)

				if(data.timestamp){
			
					const curr = `${data.timestamp}.json`
			
					const index = files.indexOf(curr)
					console.log(index)

					if(index > 0){
						const file = files[index-1]
						const result = await readJsonFile(path.join(storage_path, file))
						panel.webview.postMessage(result)
					}
				}
				else {
					const result = await readJsonFile(path.join(storage_path, `${files[files.length-1]}`))
					panel.webview.postMessage(result)
				}
			}
			else if(data.type === 'forward'){
								
				const storage_path = path.join(WORKING_DIR, '.soql')

				const files = await fs.readdir(storage_path)
				console.log(files)
				console.log(data.timestamp)

				if(data.timestamp){
			
					const curr = `${data.timestamp}.json`
			
					const index = files.indexOf(curr)
			
					if(index < files.length-1){
						const file = files[index+1]
						const result = await readJsonFile(path.join(storage_path, file))
						panel.webview.postMessage(result)
					}
				}
				else {
					const result = await readJsonFile(path.join(storage_path, `${files[files.length-1]}`))
					panel.webview.postMessage(result)
				}
			}
			
		})
	})

	context.subscriptions.push(task)
}

/**
 * 
 * @description remove all files from .soql directory
 */
async function clearDirectory(){
	
	try {

		//remove records from .soql
		const storage_path = `${WORKING_DIR}/.soql`
						
		const files = await fs.readdir(storage_path)

		const getPath = file => path.join(storage_path, file)

		files.map(file => fs.remove(getPath(file), error => error ? toast(error.message, 'error') : toast('Cleared .soql', 'status')))
	}
	catch (error) {
		toast( error, 'error' )
	}
}

/**
 * 
 * @param {String} path to ensure exists
 */
async function ensureStore(path){
	
	try {

		if( !(await exists(path)) ){
			await fs.mkdir(path)
		}
	}
	catch (error) {
		toast( error.message, 'error' )
	}
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
 * @param {String} message to relay to user
 * @param {String} type of message; error | status | default
 */
function toast( message, type ){
	
	if(type === 'error'){
		showInformationMessage(message)
	}
	else if(type === 'status'){
		setStatusBarMessage(`ℹ️ SOQL: ${message}`)
	}
	else {
		showInformationMessage(message)
	}

	return undefined
}


async function readStorage(){

	const storage_path = path.join(WORKING_DIR, '.soql')

	const files = await fs.readdir(storage_path)

	files.map(file => readJsonFile(path.join(storage_path, file)))
}


async function readJsonFile (path) {

	console.log('readJsonFile =>')
	console.log(path)
	try {

		const packageObj = await fs.readJson(path)
		console.log(packageObj)
		return packageObj
	}
	catch (error) {
	  	toast(error.message, 'error')
	}
}


async function execute(cmd) {
	try {

		const { stdout, stderr } = await exec( cmd )

		if(stderr){
			return toast(stderr, 'error')
		}

		return stdout
	}
	catch (error) {
		toast(error.message, 'error') // should contain code (exit code) and signal (that caused the termination)
	}
}

/**
 * 
 * @param {String} path -- to use to see if it exists
 */
async function exists(path) {

	const result = await fs.access(path)

	// @ts-ignore
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
	table {
		table-layout: fixed;
		width: 100%;
	}
	svg {
		bottom: 0;
		width: 70px;
		height: 70px;
		cursor: pointer;
		line-height: 1rem;
	}
	svg#back {
		float: left;
	}
	svg#forward {
		float: right;
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
		<svg id="back" viewBox="0 0 24 24">
			<path fill="#ec00ff" d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
		</svg>
		<button 
			type="button" 
			id="query">
			  Query
		</button>
		|
		<button 
			type="button" 
			id="querySave">
			  Query & Save
		</button>
		|
		<button 
			type="button" 
			id="deleteStored">
			  Delete Stored
		</button>
		<svg id="forward" viewBox="0 0 24 24">
			<path fill="#ec00ff" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
		</svg>
	</div>

	<div style="border-bottom: 2px solid #ec00ff; padding: 5px"></div>

	<div>
		<b>Total Size: </b><span id="current_totalSize"></span>
	</div>
	<div>
		<b>Current Query: </b>
		<span id="current_query"></span>
	</div>
	<div>
		<b>Current timestamp: </b>
		<span id="current_timestamp"></span>
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
	current_timestamp: document.getElementById('current_timestamp'),
	results: document.getElementById('results'),
	soql: document.getElementById('soql'),
	back: document.getElementById('back'),
	query: document.getElementById('query'),
	querySave: document.getElementById('querySave'),
	deleteStored: document.getElementById('deleteStored'),
	forward: document.getElementById('forward'),
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
	get timestamp(){
		return this._current_timestamp
	},
	set timestamp(value){
		this._current_timestamp = value
		dom.current_timestamp.textContent = value
	},
}



dom.query.onclick = event => executeQuery(dom.soql.value)
dom.querySave.onclick = event => executeQuerySave(dom.soql.value)
dom.deleteStored.onclick = event => deleteStored()
dom.back.onclick = event => back()
dom.forward.onclick = event => forward()

function back(){
	
	vscode.postMessage({ 
		type: 'back', 
		timestamp: cache.timestamp,
	})
}
function forward(){
	
	vscode.postMessage({ 
		type: 'forward', 
		timestamp: cache.timestamp,
	})
}

window.addEventListener('message', event => {

	const { data } = event


	const {
		done,
		columns,
		records,
		totalSize,
		timestamp,
		query,
	} = data;

	console.dir('HAS DATA')
	console.dir(columns)
	console.dir(totalSize)
	console.dir(timestamp)


	cache.totalSize = totalSize
	cache.timestamp = timestamp
	cache.query = query

	setupTable( records, columns )
})


function executeQuery(query) {

	cache.query = query

	vscode.postMessage({ 
		type: 'query', 
		query,
	})
}
function executeQuerySave(query) {

	cache.query = query

	vscode.postMessage({ 
		type: 'query', 
		store: true, 
		query,
	})
}
function deleteStored() {

	vscode.postMessage({ 
		type: 'delete_all',
	})
}


function setupTable(records, columns){

	clearTable()

	columns.map(col => {
		
		const th = document.createElement('th')
		th.textContent = col
		dom.thead.appendChild(th)	
	})

	records.map(record => {

		const tr = document.createElement('tr')

		const values = columns.map(key => getValue(key, record))

		console.log('values => => =>')
		console.dir(values)

		values.map(value => {
			tr.appendChild( mkTD( value ))
		})
		
		dom.tbody.appendChild(tr)
	})
}

function mkTD(value){
					
	const td = document.createElement('td')
	td.textContent = value
	return td
}
function getValue(key, record){
	
	if( record[key] ){
		return record[key]
	}

	console.log(key)	
	const data = key.split('.')

	// nested child
	if(data.length === 2){
		return record[ data[0] ][ data[1] ]
	}
	// nested nested child
	if(data.length === 3){
		return record[ data[0] ][ data[1] ][ data[2] ]
	}
	// nested nested child
	if(data.length === 4){
		return record[ data[0] ][ data[1] ][ data[2] ][ data[3] ]
	}
}

function flatten_values(obj){

	return Object.values(obj).reduce((acc, value) => {
		
		if(typeof value !== 'object'){
			return [...acc, value]
		}
		else {
			return [...acc, ...flatten_values(value)]
		}
	}, []);
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



/* 

		const values = columns.map(key => {

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
*/


