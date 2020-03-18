/* eslint-disable no-undef */

const window = {
  createStatusBarItem: jest.fn(() => ({
    show: jest.fn()
  })),
  showErrorMessage: jest.fn(),
  showWarningMessage: jest.fn(),
  createWebviewPanel: jest.fn(),
  setStatusBarMessage: jest.fn(),
  showInformationMessage: jest.fn(),
};

const workspace = {
  getConfiguration: jest.fn(),
  workspaceFolders: [
    {
      uri: {
        fsPath: "/home/jamie/repo_example"
      }
    }
  ],
  onDidSaveTextDocument: jest.fn()
};

const commands = {
  executeCommand: jest.fn(),
  registerCommand: (name, fn) => {
    console.log("mock register command: " + name);
  }
};

const vscode = {
  window,
  workspace,
  commands
};

module.exports = vscode;
