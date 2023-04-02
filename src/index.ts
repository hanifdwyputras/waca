import 'dotenv/config';

import {Client, RemoteAuth} from 'whatsapp-web.js';
import * as qrterm from 'qrcode-terminal';

import {$mongo} from '@database';
import {MongoAuthStore} from '@utilities/mongo-auth-store';
import {WaMessageContext} from '@impls/message-context';

const store = new MongoAuthStore($mongo);
const client = new Client({
	puppeteer: {
		args: ['--no-sandbox'],
	},
	authStrategy: new RemoteAuth({
		store,
		backupSyncIntervalMs: 300000,
		clientId: 'waca',
	}),
});

client.on('qr', qrcode => {
	qrterm.generate(qrcode, {small: true});
});

client.on('remote_session_saved', () => {
	console.log('[I] WWeb.js session saved');
});

client.on('auth_failure', message => {
	console.error('[E] Auth fail:', message);
});

client.on('authenticated', async session => {
	console.log('[I] Authenticated as:', session);
});

client.on('message', m => {
	const ctx = new WaMessageContext(m, ['.', '/']);

	console.log(ctx.commandName, ctx.args);
});

client.on('ready', async () => {
	console.log('WACA is ready to-go!');
});

(async () => {
	await client.initialize();
})();
