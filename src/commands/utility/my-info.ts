import stripIndent from 'strip-indent';
import {BaseCommand} from '@impls/command';
import {type WaMessageContext} from '@impls/message-context';
import {registerCommand} from '@utilities/commands';

class MyInfoCommand extends BaseCommand {
	async run(context: WaMessageContext): Promise<void> {
		const user = await context.msg.getContact();
		const number = await user.getFormattedNumber();

		const message = `
            👀 ${user.verifiedName ?? user.pushname}'s information
            - ID: ${user.id._serialized}
            - Number: ${number}
            - Name: ${user.pushname}
            - Business account: ${user.isBusiness ? 'yes' : 'nope'}
        `;
		await context.sendReply(stripIndent(message));
	}
}

registerCommand({
	name: 'myinfo',
	description: 'Show your whatsapp account basic information',
	cooldown: 5_000,
	args: [],
	aliases: ['my-info', 'myi'],
}, MyInfoCommand);

