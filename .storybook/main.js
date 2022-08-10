const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

module.exports = {
	stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
	addons: [
		'@storybook/addon-links',
		'@storybook/addon-essentials',
		'@storybook/addon-interactions',
		'storybook-addon-next-router',
	],
	framework: '@storybook/react',
	// reference: https://github.com/storybookjs/storybook/issues/6316#issuecomment-659726964
	webpackFinal: async (config, { configType }) => {
		config.resolve.plugins = [new TsconfigPathsPlugin()]
		return config
	},
}
