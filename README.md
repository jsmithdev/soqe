# SOQE (saké) 🦄

## Salesforce Object Query Extension

Free to install [here on the VS Code marketplace](https://marketplace.visualstudio.com/items?itemName=jamiesmiths.soqe)

![SOQE View](https://i.imgur.com/EIq4lD2.png)

### Features

- view Salesforce data quickly & easily in vs code
  - have potential to use data for LWC/Node/JS testing, scratch pads, etc

- choose to save to look back at what was queried before
  - saves under {PROJECT ROOT}/.soql

- run in a SFDX project w/o any extra config

  - works in any project as long as `{PROJECT ROOT}/.sfdx/sfdx-config.json` contains a `defaultusername` key/value -- for integrations, etc

  - surfaces a message when no `defaultusername` is found

- attempts to surface only the important parts of error messages from sfdx (if need be)

### Hotkeys

- inside the text editor, you can hit `Ctrl+Enter` to run the query
- inside the text editor, you can hit `Ctrl+Shift+Enter` to run the query & save it

---

Made with 💙 by [Jamie Smith](https://jsmith.dev)
