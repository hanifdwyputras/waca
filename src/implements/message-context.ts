import {Lexer, Parser, PrefixedStrategy} from '@sapphire/lexure';
import type * as WAWebJS from 'whatsapp-web.js';

/**
 * @class WAMessageContext
 */
export class WaMessageContext {
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
	 * @param {WAWebJS.Client} client WWeb.js Client
     * @param {string[]} prefixMatches Prefix matches for message
     */
	constructor(protected readonly msg: WAWebJS.Message, protected readonly client: WAWebJS.Client, private readonly prefixMatches: string[]) {}

	get id(): string {
		return this.msg.id.id;
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

	async sendReply(c: WAWebJS.MessageContent): Promise<WaMessageContext> {
		const m = await this.client.sendMessage(this.jid, c, {
			quotedMessageId: this.id,
		});

		return new WaMessageContext(m, this.client, this.prefixMatches);
	}

	getOption(option: string): string[] {
		return this.preprocessed.options.get(option) ?? [];
	}

	protected get preprocessed() {
		return this.parser.run(this.lexer.run(this.text));
	}
}
