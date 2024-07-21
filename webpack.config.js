const path = require('path');

module.exports = {
	// ... các config khác
	resolve: {
		alias: {
			'@*': path.resolve(__dirname, 'src')
		},
		extensions: [ '.ts', '.js']
	},
	// ...
};