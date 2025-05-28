import puppeteer from 'puppeteer';
import { fork } from 'child_process';
import log from '../src/js/card-widget/logger.js';

jest.setTimeout(30000);

const module = 'e2e-widget.test';

describe('widget test', () => {
	const baseUrl = 'http://localhost:9000';
	let server;
	let browser;
	let page;

	beforeAll(async () => {
		server = fork(`${__dirname}/e2e.server.js`);
		await new Promise((resolve, reject) => {
			server.on('error', reject);
			server.on('message', (message) => {
				if (message === 'ok') {
					resolve();
				}
			});
		});
	});

	beforeEach(async () => {
		// AppVeyor doesn't eat this
		// browser = await puppeteer.launch({
		// 	headless: false,
		// 	slowMo: 100,
		// 	devtools: true,
		// });
		browser = await puppeteer.launch({
			headless: 'new', // либо true
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});

		page = await browser.newPage();
	});

	test('should render', async () => {
		await page.goto(baseUrl);
		await page.waitForSelector('.card-widget');
	});

	test('should fill result div textContent', async () => {
		await page.goto(baseUrl);
		await page.waitForSelector('.card-widget');

		const widget = await page.$('.card-widget');
		const input = await widget.$('#widget-card-number');
		const button = await widget.$('#widget-validate-button');
		const result = await widget.$('#widget-result');

		await input.type('4111111111111112');
		await button.click();

		const textContent = await page.evaluate((el) => el.textContent, result);

		expect(textContent).toBe('The card number didn\'t pass the Luhn algorithm validation');
	});

	test('widget should make Visa logo .active', async () => {
		await page.goto(baseUrl);
		await page.waitForSelector('.card-widget');

		const widget = await page.$('.card-widget');
		const input = await widget.$('#widget-card-number');
		const button = await widget.$('#widget-validate-button');
		const logo = await widget.$('#visa');

		await input.type('4111111111111111');
		await button.click();

		const classList = await page.evaluate((el) => [...el.classList], logo);

		expect(classList.includes('active')).toBe(true);
		log(`>${classList}<`, module);
	});

	afterEach(async () => {
		await browser.close();
	});

	afterAll(() => {
		if (server && server.kill) {
			server.kill();
		}
	});
});
