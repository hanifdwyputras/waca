import {Collection} from '@discordjs/collection';
import {type BaseCommand} from '@impls/command';
import {type CommandOptions} from '@typings/args';

export const waCommands = new Collection<string, BaseCommand>();
export const waCooldown = new Collection<string, {
	t: number;
	w: boolean;
}>();
export const registerCommand = <T extends typeof BaseCommand>(
	options: CommandOptions,
	Target: T,
) => {
	const instance = new Target(options);

	waCommands.set(options.name, instance);
};
