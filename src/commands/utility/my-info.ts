import stripIndent from 'strip-indent';
import {BaseCommand} from '@impls/command';
import {type WaMessageContext} from '@impls/message-context';
import {registerCommand} from '@utilities/commands';

class MyInfoCommand extends BaseCommand {
	async run(context: WaMessageContext): Promise<void> {
		const number = await context.contact.getFormattedNumber();

		const message = `
            👀 ${context.contact.verifiedName ?? context.contact.pushname}'s information
            - ID: ${context.contact.id._serialized}
            - Number: ${number}
            - Name: ${context.contact.pushname}
            - Business account: ${context.contact.isBusiness ? 'yes' : 'nope'}
        `;
		await context.sendReply((stripIndent as (t: string) => string)(message));
	}
}

registerCommand({
	name: 'myinfo',
	description: 'Show your whatsapp account basic information',
	cooldown: 5_000,
	args: [],
	aliases: ['my-info', 'myi'],
}, MyInfoCommand);

