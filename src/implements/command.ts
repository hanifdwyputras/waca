import {
	type ArgumentType,
	type CommandOptions,
	type Argument,
} from '@typings/args';
import {ArgumentContext} from './argument-context';
import {type WaMessageContext} from './message-context';

export class BaseCommand {
	public name!: string;
	public description!: string;
	public args: Array<Argument<ArgumentType>> = [];
	public cooldown!: number;
	public aliases: string[] = [];
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
	}

	async run(context: WaMessageContext): Promise<void> {
		await context.sendReply(`It's a default message for ${this.name} command`);
	}

	async init(context: WaMessageContext): Promise<void> {
		if (typeof this.run === 'function') {
			this.argsInstance = new ArgumentContext(context, this.args);
			this.run(context).catch(async (err: Error) => {
				if (
					typeof err === 'object'
					&& Reflect.has(err, 'message')
					&& Reflect.has(err, 'name')
				) {
					await context.sendReply(`An error occured:\n${err.name}: ${err.message}`);
				}
			});
		}
	}
}
