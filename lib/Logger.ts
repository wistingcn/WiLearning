const debug = require('debug');
// debug.enable('wiser-server:* mediasoup:*');
debug.enable('wiser-server:*');

const APP_NAME = 'wiser-server';

export class Logger
{
	public debug;
	public info;
	public warn;
	public error;

	constructor(prefix?: string)
	{
		if (prefix)
		{
			this.debug = debug(`${APP_NAME}:DEBUG:${prefix}`);
			this.info = debug(`${APP_NAME}:INFO:${prefix}`);
			this.warn = debug(`${APP_NAME}:WARN:${prefix}`);
			this.error = debug(`${APP_NAME}:ERROR:${prefix}`);
		}
		else
		{
			this.debug = debug(`${APP_NAME}:DEBUG`);
			this.info = debug(`${APP_NAME}:INFO`);
			this.warn = debug(`${APP_NAME}:WARN`);
			this.error = debug(`${APP_NAME}:ERROR`);
		}

		this.debug.log = console.info.bind(console);
		this.info.log = console.info.bind(console);
		this.warn.log = console.warn.bind(console);
		this.error.log = console.error.bind(console);
	}
}
