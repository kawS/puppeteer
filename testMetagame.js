const puppeteer = require('puppeteer');
const puppeteerCore = require('puppeteer-core');
const fs = require('fs');

(async () => {
	async function createPageWithInterception(browser, blockType = ['image', 'font', 'media', 'stylesheet', 'script']) {
		const page = await browser.newPage();
		await page.setRequestInterception(true);
		page.on('request', request => {
			if (blockType.includes(request.resourceType())) {
				request.abort();
			} else {
				request.continue();
			}
		});
		// page.on('response', response => {
		// 	console.log('res:', response.url());
		// });
		return page;
	}

	try {
		const browser = await puppeteer.launch({
			// executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
			// defaultViewport: {
			// 	width: 390,
			// 	height: 844
			// },
			// headless: false,
		});
		const page = await createPageWithInterception(browser);
		try {
			await page.goto('https://www.mtggoldfish.com/metagame/standard/full#paper');
		} catch (error) {
			console.error('# browser:', error.message);
			await browser.close();
			return;
		}
		await page.select('#period', '7');
		await page.waitForSelector('#metagame-decks-container', {
			visible: true
		});
		const _array = await page.$eval('#metagame-decks-container', el => {
			const divList = el.querySelectorAll('.archetype-tile');
			const strList = [];
			let i = 0;
			for (let item of divList) {
				const a = item.querySelector('.deck-price-paper > a');
				const obj = {
					name: a.innerText.trim(),
					url: a.href,
					type: 'Metagame',
					mana: item.querySelector('.manacost').getAttribute('aria-label').replace('colors:', '').trim().replaceAll(' ', '|'),
					deck: []
				};
				strList.push(obj);
				i++;
			}
			return strList;
		});
		const listLength = _array.length;
		await page.close();
		const tempArr = _array//.splice(0, 10);
		console.log(`- load table ${listLength}(${tempArr.length}) done`);
		let x = 1;
		for (let item of tempArr) {
			console.log(`-- load deck: ${x} ${item.name}`);
			const newPage = await createPageWithInterception(browser, ['image', 'font', 'media', 'stylesheet']);
			await newPage.goto(item.url);
			try {
				await newPage.waitForSelector('.deck-view-deck-table', {
					visible: true
				});
				const det = await newPage.$eval('.deck-view-deck-table', tb => {
					const trs = tb.querySelectorAll('tr');
					const deck = [];
					let category = '';
					trs.forEach(tr => {
						if (tr.className == 'deck-category-header') {
							category = tr
								.querySelector('th')
								.innerText.replace(/\s/g, '')
								.replace(/\(\d+\)/, '');
						} else {
							const tds = tr.querySelectorAll('td');
							const count = tds[0].innerText.trim();
							const a = tds[1].querySelector('a');
							deck.push({
								name: a.innerText.trim(),
								count,
								category
							});
						}
					});
					return deck;
				});
				item.deck = det;
			} catch (error) {
				console.error(`# link: ${item.url}`, error.message);
				item.deck = [];
			} finally {
				await newPage.close();
			}
			x += 1;
		}
		fs.writeFile('./json/demo.json', JSON.stringify({ result: tempArr }), err => {
			if (err) throw err;
			console.log(`The file has been saved ${tempArr.length}!`);
		});
		await browser.close();
	} catch (error) {
		console.error('# main:', error.message);
	}
})();
