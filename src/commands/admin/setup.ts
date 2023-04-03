import {BaseCommand} from '@impls/command';
import {type WaMessageContext} from '@impls/message-context';
import {groupModel} from '@models/group';
import {registerCommand} from '@utilities/commands';
import stripIndent from 'strip-indent';
import type WAWebJS from 'whatsapp-web.js';

class SetupGroupCommand extends BaseCommand {
	async run(context: WaMessageContext): Promise<void> {
		const chat = await context.msg.getChat();
		const g = await groupModel.findById(chat.id._serialized);

		if (g) {
			await context.sendReply('This group is already initialized.');
		} else {
			await context.sendReply('Initializing ...');
			const g2 = await groupModel.create({
				_id: chat.id._serialized,
				name: chat.name,
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				owner: (chat as WAWebJS.GroupChat).owner._serialized,
			});
			await context.sendReply((stripIndent as (t: string) => string)(`
				This group properties has saved to database:
				0. ID: ${g2._id}
				1. Name: ${g2.name!}
				2. Owner: ${g2.owner!}
			`));
		}
	}
}

registerCommand({
	name: 'setup',
	description: 'Setup group captcha settings',
	cooldown: 3_000,
	aliases: ['initialize', 'init'],
	args: [],
	onlyAdmin: true,
}, SetupGroupCommand);
