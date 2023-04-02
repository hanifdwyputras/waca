import 'dotenv/config';

import {Client, RemoteAuth} from 'whatsapp-web.js';
import * as qrterm from 'qrcode-terminal';

import {$mongo} from './database.js';
import {MongoAuthStore} from '@utilities/mongo-auth-store';

const client = new Client({
	puppeteer: {
		args: ['--no-sandbox'],
	},
	authStrategy: new RemoteAuth({
		store: new MongoAuthStore($mongo),
		backupSyncIntervalMs: 300000,
	}),
});

client.on('qr', qrcode => {
	qrterm.generate(qrcode, {small: true});
});

client.on('remote_session_saved', () => {
	console.log('[I] WWeb.js session saved');
});

client.on('ready', async () => {
	console.log('WACA is ready to-go!');
});

void client.initialize();
