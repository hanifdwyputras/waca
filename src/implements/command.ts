import {
	type ArgumentType,
	type CommandOptions,
	type Argument,
} from '@typings/args';
import {ArgumentContext} from './argument-context';
import {type WaMessageContext} from './message-context';
import {waCooldown} from '@utilities/commands';
import type WAWebJS from 'whatsapp-web.js';

export class BaseCommand {
	public name!: string;
	public description!: string;
	public args: Array<Argument<ArgumentType>> = [];
	public cooldown!: number;
	public aliases: string[] = [];
	public onlyAdmin = false;
	public argsInstance!: ArgumentContext;

	/**
	 * @constructor
	 * @param {CommandOptions} options Command options to apply
	 */
	constructor(options: CommandOptions) {
		if (typeof options.name !== 'string') {
			throw new TypeError('Invalid options.name');
		}

		this.name = options.name;
		this.description = options.description || '';
		this.args = Array.isArray(options.args) ? options.args : [];
		this.cooldown
			= typeof options.cooldown === 'number' && options.cooldown >= 1_000
				? options.cooldown
				: 5_000;
		this.aliases = Array.isArray(options.aliases) ? options.aliases : [];
		this.onlyAdmin = options.onlyAdmin ?? false;
	}

	async run(context: WaMessageContext): Promise<void> {
		await context.sendReply(`It's a default message for ${this.name} command`);
	}

	async init(context: WaMessageContext): Promise<void> {
		if (typeof this.run === 'function') {
			const chat = await context.msg.getChat();
			const user = await context.msg.getContact();

			if (this.onlyAdmin) {
				if (!chat.isGroup) {
					return;
				}

				if (chat.isGroup) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
					const p = (chat as WAWebJS.GroupChat).participants.find(
						(pc: WAWebJS.GroupParticipant) => pc.id._serialized === user.id._serialized,
					);

					if (!p) {
						return;
					}

					if (p && (!p.isAdmin || !p.isSuperAdmin)) {
						return;
					}
				}
			}

			const payload = Buffer.from(`${chat.id._serialized}__${user.id._serialized}`)
				.toString('hex');

			if (waCooldown.has(payload)) {
				const d = waCooldown.get(payload)!;
				if (d.t <= Date.now()) {
					waCooldown.delete(payload);
				} else if (d.t > Date.now() && !d.w) {
					await context.sendReply('Please wait for ' + new Date(d.t - Date.now()).getSeconds().toString() + ' seconds');
					waCooldown.set(payload, {
						...d,
						w: true,
					});
					return;
				}
			}

			this.argsInstance = new ArgumentContext(context, this.args);
			await this.run(context).catch(async (err: Error) => {
				if (
					typeof err === 'object'
					&& Reflect.has(err, 'message')
					&& Reflect.has(err, 'name')
				) {
					await context.sendReply(`An error occured:\n${err.name}: ${err.message}`);
				}
			}).then(() => {
				waCooldown.set(payload, {
					t: Date.now() + this.cooldown,
					w: false,
				});
			});
		}
	}
}
