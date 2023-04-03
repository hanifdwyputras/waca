import {Lexer, Parser, PrefixedStrategy} from '@sapphire/lexure';
import type * as WAWebJS from 'whatsapp-web.js';
import {type BaseCommand} from './command';
import {waCommands} from '@utilities/commands';

/**
 * @class WAMessageContext
 */
export class WaMessageContext {
	public client!: WAWebJS.Client;
	public chat!: WAWebJS.Chat;
	public contact!: WAWebJS.Contact;

	protected lexer = new Lexer({
		quotes: [
			['"', '"'],
			['“', '”'],
			['「', '」'],
		],
	});

	protected parser = new Parser(new PrefixedStrategy(['--'], ['=', ':']));

	/**
     * @constructor
     * @param {WAWebJS.Message} msg WWeb.js message
     * @param {string[]} prefixMatches Prefix matches for message
     */
	constructor(public readonly msg: WAWebJS.Message, private readonly prefixMatches: string[]) {}

	get id(): string {
		return this.msg.id._serialized;
	}

	get fromMe(): boolean {
		return this.msg.id.fromMe;
	}

	get jid(): string {
		return this.msg.id.remote;
	}

	get text(): string {
		return this.msg.body;
	}

	get isBroadcast(): boolean {
		return this.msg.broadcast;
	}

	get senderJid(): string {
		return this.msg.from;
	}

	get isCommand(): boolean {
		return Boolean(this.prefixMatch);
	}

	get flags(): string[] {
		return [...this.preprocessed.flags];
	}

	get commandName(): string | undefined {
		return this.preprocessed.ordered.at(0)?.value
			.slice(this.prefixMatch?.length ?? 0);
	}

	get prefixMatch(): string | undefined {
		for (const prefix of this.prefixMatches) {
			if (
				this.text.toLowerCase().startsWith(prefix.toLowerCase())
			) {
				return prefix;
			}
		}

		return undefined;
	}

	get args(): string[] {
		return this.preprocessed.ordered
			.map(order => order.value).slice(1);
	}

	async sendReply(c: WAWebJS.MessageContent, o?: WAWebJS.MessageSendOptions): Promise<WaMessageContext> {
		const m = await this.client.sendMessage(this.jid, c, {
			...o,
			quotedMessageId: this.id,
		});

		return new WaMessageContext(m, this.prefixMatches);
	}

	getCommand<C extends BaseCommand>(): C | undefined {
		return waCommands
			.find(c => c.name === this.commandName?.toLowerCase() || c.aliases
				.includes(this.commandName!)) as C;
	}

	getOption(option: string): string[] {
		return this.preprocessed.options.get(option) ?? [];
	}

	protected get preprocessed() {
		return this.parser.run(this.lexer.run(this.text));
	}
}
