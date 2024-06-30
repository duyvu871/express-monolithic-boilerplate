import morgan from 'morgan';
import moment from 'moment';

// Define your custom tokens
morgan.token('splitter', (req) => {
	return '\x1b[36m--------------------------------------------\x1b[0m\n';
});

morgan.token('statusColor', (req, res) => {
	// get the status code if response written
	const status =
		typeof res.headersSent !== 'boolean'
			? Boolean(res.headersSent)
			: res.headersSent
				? res.statusCode
				: undefined;
	const parsedStatus = parseInt(status as unknown as string) || 0;
	// get status color
	const color =
		parsedStatus >= 500
			? 31 // red
			: parsedStatus >= 400
				? 33 // yellow
				: parsedStatus >= 300
					? 36 // cyan
					: parsedStatus >= 200
						? 32 // green
						: 0; // no color

	return '\x1b[' + color + 'm' + status + '\x1b[0m';
});

morgan.token('date', function(){
	return '[' + moment().format('m/d/Y h:m:s') + ']'
})

export const morganMiddleware = morgan(`:splitter:date \x1b[33m:method\x1b[0m - \x1b[36mHTTP/:http-version\x1b[0m - \x1b[36m:url\x1b[0m - :statusColor - :response-time ms - length::res[content-length]`);