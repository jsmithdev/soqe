module.exports = {
	activate,
}


const vscode = require('vscode')
const fs = require('fs-extra')
const path = require('path')

const {
	toast,
} = require('./util/toast');

const {
	execute,
	getUserName,
	readJsonFile,
	flatten_record,
	clearDirectory,
	ensureDirectory,
} = require('./util/util');


const WORKING_DIR = `${vscode.workspace.workspaceFolders[0].uri.fsPath}`
const STORAGE_PATH = path.join(WORKING_DIR, '.soql')
const MAIN_VIEW = require('./view/main_view')


ensureDirectory( STORAGE_PATH )


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	const task = vscode.commands.registerCommand('extension.soqe', async function () {

		const username = await getUserName(WORKING_DIR)

		if(!username){
			return toast(`No defaultusername found in ${WORKING_DIR}/.sfdx/sfdx-config.json`, 'info')
		}

		const panel = vscode.window.createWebviewPanel(
			'soqeView',
			'SOQE View',
			vscode.ViewColumn.One,
			{
			  enableScripts: true,
			  retainContextWhenHidden: true,
			}
		);
		
		panel.webview.html = MAIN_VIEW
		
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

				const file_path = path.join(STORAGE_PATH, `${timestamp}.json`)

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
						
				clearDirectory(STORAGE_PATH)
			}
			else if(data.type === 'back'){

				const files = await fs.readdir(STORAGE_PATH)

				if(data.timestamp){
			
					const curr = `${data.timestamp}.json`
			
					const index = files.indexOf(curr)

					if(index > 0){
						const file = files[index-1]
						const result = await readJsonFile(path.join(STORAGE_PATH, file))
						panel.webview.postMessage(result)
					}
				}
				else {
					const result = await readJsonFile(path.join(STORAGE_PATH, `${files[files.length-1]}`))
					panel.webview.postMessage(result)
				}
			}
			else if(data.type === 'forward'){
				
				const files = await fs.readdir(STORAGE_PATH)

				if(data.timestamp){
			
					const curr = `${data.timestamp}.json`
			
					const index = files.indexOf(curr)
			
					if(index < files.length-1){
						const file = files[index+1]
						const result = await readJsonFile(path.join(STORAGE_PATH, file))
						panel.webview.postMessage(result)
					}
				}
				else {
					const result = await readJsonFile(path.join(STORAGE_PATH, `${files[files.length-1]}`))
					panel.webview.postMessage(result)
				}
			}
			
		})
	})

	context.subscriptions.push(task)
}