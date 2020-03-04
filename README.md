# SOQE

## Salesforce Object Query Extension (saké) 🦄

![SOQE View](https://i.imgur.com/EIq4lD2.png)

### Goals

- view Salesforce data quickly & easily in vs code

- store Salesforce data to look back at what was queried before and after for a particular project

- run in a SFDX project w/o any extra config

  - not have to be SFDX project, for instance a Node middleware integration

    - as long as `ROOT/.sfdx/sfdx-config.json` contains a `defaultusername` key/value

    - toast should say as much when no `defaultusername` is found)


- have potential to use data for LWC/Node/JS testing, scratch pads, etc


### WIP: Path to init release

- ~~query editor~~ ✔

- ~~store results under `.data` for later viewing or consumption in tests (LWC, etc)~~ ✔

- ~~results view~~ ✔

- ~~review old queries+results+time+username used; perhaps arrows left and right for time UX;~~ ✔

- dog food

- clean

---

Made with 💙 by [Jamie Smith](https://jsmith.dev)