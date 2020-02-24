# SOQL

## View & Store Salesforce data 🦄

<img src="https://i.imgur.com/5zWp63k.png"  />

### Goals

- run in a SFDX project with only SFDX installed w/o any extra config

- view Salesforce data quickly, easily

- store Salesforce data to look back at what was queried before for a particular project

- have potential to use data for LWC/Node/JS testing, scratch pads, etc

- not have to be SFDX project, for instance a Node middleware integration

  - as long as `ROOT/.sfdx/sfdx-config.json` contains a `defaultusername` key/value

    - toast should say as much when no `defaultusername` is found)

### WIP: Path to init release

- ~~query editor~~ ✔

- ~~store results under `.data` for later viewing or consumption in tests (LWC, etc)~~ ✔

- ~~results view~~ ✔

- review old queries+results+time+username used; perhaps arrows left and right for time UX;

- clean code

- dog food

### Enhancements: possible ideas

- copy to clipboard UX: query or records array

---

Made with 💙 by [Jamie Smith](https://jsmith.dev)