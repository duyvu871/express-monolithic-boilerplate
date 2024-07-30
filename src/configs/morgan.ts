import morgan, { Morgan } from 'morgan';
import moment from 'moment';
import fs from 'fs';
import * as process from 'node:process';
import path from 'path';
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

const accessLogStream = fs.createWriteStream(path.join(process.cwd(), "storage/Log/log-connected-brain.log"), { flags: 'a' });
morgan.token('date', function(){
	return '[' + moment().format('m/d/Y h:m:s') + ']'
});
const formatString = `:splitter:date \x1b[33m:method\x1b[0m - \x1b[36mHTTP/:http-version\x1b[0m - \x1b[36m:url\x1b[0m - :statusColor - :response-time ms - length::res[content-length]`;

const loggerOpt: morgan.Options<any, any> = {};

if (process.env.NODE_ENV === "production") {
	loggerOpt.stream = accessLogStream;
}

export const morganMiddleware = morgan(process.env.NODE_ENV  === "production" ? "combined" : formatString, {...loggerOpt});