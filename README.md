# SOQE (saké) 🦄

## Salesforce Object Query Extension

Free to install [here on the VS Code marketplace](https://marketplace.visualstudio.com/items?itemName=jamiesmiths.soqe)

![SOQE View](https://i.imgur.com/EIq4lD2.png)

### Goals

- view Salesforce data quickly & easily in vs code

- store Salesforce data to look back at what was queried before and after for a particular project

- run in a SFDX project w/o any extra config

  - not have to be SFDX project, for instance a Node middleware integration

    - as long as `ROOT/.sfdx/sfdx-config.json` contains a `defaultusername` key/value

    - toast should say as much when no `defaultusername` is found)

- have potential to use data for LWC/Node/JS testing, scratch pads, etc

- attempts to surface important parts of error messages

---

Made with 💙 by [Jamie Smith](https://jsmith.dev)
