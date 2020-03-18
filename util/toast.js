const vscode = require('vscode')

const {
	setStatusBarMessage,
	showInformationMessage,
} = vscode.window;

module.exports = {
	/**
	 * 
	 * @param {String} message to relay to user
	 * @param {String} type of message; error | status | default
	 */
	toast: ( message, type ) => {
		
		if(type === 'error'){
			showInformationMessage(message)
		}
		else if(type === 'status'){
			setStatusBarMessage(`SOQE: ${message}`)
		}
		else {
			showInformationMessage(message)
		}

		return undefined
	}
}