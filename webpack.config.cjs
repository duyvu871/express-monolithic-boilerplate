const path = require('path');

module.exports = {
	entry: './src/app.ts',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/, // Sử dụng  ts-loader  cho cả  .ts và .tsx
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	// ... Các cấu hình Webpack  khác  nếu cần ...
}; 