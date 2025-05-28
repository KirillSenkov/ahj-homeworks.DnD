import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import config from '../webpack.dev.js';

const compiler = webpack(config);
const server = new WebpackDevServer(config.devServer, compiler);

(async () => {
	await server.start();

	if (process.send) {
		process.send('ok');
	}
})();
