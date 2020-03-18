/* eslint-disable no-undef */
const main_view = require('./../view/main_view')

it('Main view is html string', () => {
    expect(main_view).toContain('<html>')
    expect(main_view).toContain('</html>')
})