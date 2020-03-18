
// eslint-disable-next-line no-undef
jest.mock('vscode')

const {
	toast,
} = require('../util/toast');

it('Runs', () => {
	toast('message is here', 'info')
})

