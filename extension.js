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

	console.log('Congratulations, your extension "soql" is now active!')

	const task = vscode.commands.registerCommand('extension.soql', async function () {

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
			
			console.log(query)

			//todo raw_query; remove line breaks, trim

			const username = await getUserName()

			if(!username){
				return toast(`No username found at ${WORKING_DIR}/.sfdx/sfdx-config.json`, 'info')
			}
			
			toast(username, 'status')

			const cmd = `sfdx force:data:soql:query --json -u ${username} -q "${query}" `

			const results = await execute(cmd)
			console.log('await execute results')
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


	});

	context.subscriptions.push(task);
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

		const data = await fs.readFile(path)

		const { defaultusername } = JSON.parse( data )

		return defaultusername
	} catch (error) {
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
		setStatusBarMessage(message)
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

async function exists(path) {
	try {

		const result = await fs.access(path)
		return result && result.code === 'ENOENT' ? false : true
	}
	catch (error) {
		console.error(error)
	}
}













function getView() {
return /* html */`
<html>

<style>
	div {
		padding: 2px;
		text-align: center;
  	}
	button {
		cursor:pointer;
		margin: 3px;
		border-radius: 5px;
	}
</style>

<body>
	<div>
		<textarea>select id from account limit 2</textarea>
	</div>

	<div>
		<button 
			type="button" 
			onclick="executeQuery()">
			  Query
		</button>
	</div>

	<div style="border-bottom: 2px solid #ec00ff; padding: 5px"></div>

	<div id="results"></div>
</body>

<script>

const vscode = acquireVsCodeApi()

function executeQuery() {
	
	const query = document.querySelector('textarea').value

	vscode.postMessage({ query })
}

window.addEventListener('message', event => {
	const { data } = event

	console.log('VIEW HAS INFO BACK')
	//console.log(event)
	
	const {
		done,
		records,
		totalSize,
	} = data;

	console.dir( records )
})

</script>
</html>
`
}