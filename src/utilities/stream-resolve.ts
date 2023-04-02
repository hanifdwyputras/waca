import {type Stream} from 'node:stream';

export const waitUntilStreamResolved = async (stream: Stream): Promise<unknown> => new Promise((resolve, reject) => {
	stream
		.on('end', resolve)
		.on('error', reject)
		.on('close', resolve);
});
