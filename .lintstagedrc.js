const path = require('path')

const buildEslintCommand = (filenames) =>
	`next lint --fix --file ${filenames
		.map((f) => path.relative(process.cwd(), f))
		.join(' --file ')}`

module.exports = {
	// N.B. Ignore folder `functions` -- has its own tsc & lint configs
	'!(functions/**/*)*.{ts,tsx}': [buildEslintCommand],
}
