const puppeteer = require('puppeteer');
// const puppeteerCore = require('puppeteer-core');
const nodemailer = require('nodemailer');
const fs = require('fs');

const transporter = nodemailer.createTransport({
	host: 'mail.sohu.com',
	port: 465,
	auth: {
		user: 'sacg@sohu.com',
		pass: 'Y23MEXKIDAOLH'
	}
});

const delay = time => {
	return new Promise(resolve => {
		setTimeout(resolve, time);
	});
};

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
			// headless: false
		});
		const page = await createPageWithInterception(browser);
		try {
			await page.goto('https://www.mtggoldfish.com/tournaments/standard#paper');
		} catch (error) {
			console.error('# browser:', error.message);
			await browser.close();
			return;
		}
		const _array = await page.$eval('.similar-events-container', el => {
			const h4List = el.querySelectorAll('h4');
			const strList = [];
			let i = 0;
			for (let h4 of h4List) {
				const aList = h4.querySelectorAll('a');
				const obj = {
					name: '',
					url: '',
					type: 'Tournaments',
					decks: []
				};
				if (aList.length > 1 && aList[0].innerText.trim() == '') {
					obj.name = aList[1].innerText.trim();
					obj.url = aList[1].href;
				} else if (aList.length > 0 && aList[0].innerText.trim() != '') {
					obj.name = aList[0].innerText.trim();
					obj.url = aList[0].href;
				}
				const table = el.querySelectorAll('table')[i];
				const tbody = table.querySelector('tbody');
				const trList = tbody.querySelectorAll('tr');
				for (let tr of trList) {
					const td = tr.querySelectorAll('td')[1];
					const a = td.querySelector('.deck-price-paper > a');
					obj.decks.push({
						name: a.innerText.trim(),
						url: a.href,
						mana: td.querySelector('.manacost').getAttribute('aria-label').replace('mana cost: ', '').replaceAll(' ', '|'),
						det: []
					});
				}
				strList.push(obj);
				i++;
			}
			return strList;
		});
		const listLength = _array.length;
		await page.close();
		const cusLength = 0;
		const tempArr = cusLength === 0 ? _array : _array.splice(0, cusLength);
		console.log(`- load table ${listLength}(${tempArr.length}) done`);
		let x = 1;
		for (let date of tempArr) {
			let maxDeck = date.decks.length;
			let j = 1;
			console.log(`-- load table: ${x}`);
			for (let deck of date.decks) {
				const newPage = await createPageWithInterception(browser, ['image', 'font', 'media', 'stylesheet']);
				await newPage.goto(deck.url);
				try {
					await newPage.waitForSelector('.deck-view-deck-table', {
						visible: true
					});
					console.log(`--- decks: ${j}/${maxDeck}, ${deck.name}`);
					await delay(500);
					j += 1;
					const det = await newPage.$eval('.deck-view-deck-table', tb => {
						const trs = tb.querySelectorAll('tr');
						const decks = [];
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
								decks.push({
									name: a ? a.innerText.trim() : tds[1].innerText.trim(),
									set: a
										? a
												.getAttribute('data-card-id')
												.match(/\[([A-Z])+\]/g)?.[0]
												?.replace(/\[|\]/g, '')
												.replace(/\[|\]/g, '') ?? ''
										: '',
									count,
									category
								});
							}
						});
						return decks;
					});
					deck.det = det;
				} catch (error) {
					console.error(`# link: ${deck.url}`, error.message);
					deck.det = [];
				} finally {
					await newPage.close();
				}
			}
			x += 1;
		}
		fs.writeFile('./json/demoTournaments.json', JSON.stringify({ result: tempArr }), err => {
			if (err) throw err;
			console.log('The file has been saved!');
		});
		await browser.close();

		// const info = await transporter.sendMail({
		// 	from: 'sacg@sohu.com',
		// 	to: 'sacg@sohu.com',
		// 	subject: 'jsonData',
		// 	html: '<b>Hello world?</b>',
		// 	attachments: [
		// 		{
		// 			filename: 'demoTournaments.json',
		// 			path: './json/demoTournaments.json'
		// 		}
		// 	]
		// });
		// console.log('Message sent:', info.messageId);
	} catch (error) {
		console.error('# main:', error.message);
	}
})();
