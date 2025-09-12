const nodemailer = require('nodemailer');

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
	host: 'mail.sohu.com',
	port: 465,
	auth: {
		user: 'sacg@sohu.com',
		pass: 'Y23MEXKIDAOLH'
	}
});

// Wrap in an async IIFE so we can use await.
(async () => {
	const info = await transporter.sendMail({
		from: 'sacg@sohu.com',
		to: 'sacg@sohu.com',
		subject: 'test',
		html: '<b>Hello world?</b>'
		// attachments: [
		// 	{
		// 		filename: 'demo.json',
		// 		path: './json/demo.json'
		// 	}
		// ]
	});

	console.log('Message sent:', info.messageId);
})();
