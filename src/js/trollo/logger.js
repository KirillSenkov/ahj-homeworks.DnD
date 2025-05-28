class Logger {
	get() { return this.log.bind(this); }

	getFormattedTimestamp() {
		const now = new Date();

		const day = String(now.getDate()).padStart(2, '0');
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const year = String(now.getFullYear()).slice(-2);

		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		const seconds = String(now.getSeconds()).padStart(2, '0');
		const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

		return `[${day}.${month}.${year} ${hours}:${minutes}:${seconds}.${milliseconds}]`;
	}

	log(msg, module) {
		const timestamp = this.getFormattedTimestamp();
		const logEntry = `${timestamp} [${module}] ${msg}`;

		console.log(logEntry);

		return logEntry;
	}
}

const logger = new Logger();
export default logger.get();
