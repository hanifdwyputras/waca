import mongoose from 'mongoose';
import {createReadStream, createWriteStream} from 'node:fs';
import type {Store as AuthStore} from 'whatsapp-web.js';

import {waitUntilStreamResolved} from '@utilities/stream-resolve';

// Source (refactored to TypeScript): https://github.com/jtourisNS/wwebjs-mongo/blob/main/src/MongoStore.js

/**
 * @class MongoAuthStore
 */
export class MongoAuthStore implements AuthStore {
	protected $bucket!: mongoose.mongo.GridFSBucket;
	/**
     * @constructor
     * @param {mongoose.Connection} $mongo Mongoose connection instance
     */
	constructor(private readonly $mongo: mongoose.Connection) {}

	async sessionExists(options: {session: string}): Promise<boolean> {
		const collection = this.$mongo.collection(
			this.getBucketName(options.session).concat('.files'),
		);
		const documents = await collection.estimatedDocumentCount({});
		return documents > 0;
	}

	async extract(options: {session: string; path: string}): Promise<void> {
		await this.initBucketIfNeccesary(options.session);
		const stream = this.$bucket.openDownloadStreamByName(
			this.cleanupSessionString(options.session).concat('.zip'),
		).pipe(createWriteStream(options.path));

		await waitUntilStreamResolved(stream);
	}

	async save(options: {session: string}): Promise<void> {
		await this.initBucketIfNeccesary(options.session);
		await waitUntilStreamResolved(
			createReadStream(this.cleanupSessionString(options.session).concat('.zip'))
				.pipe(this.$bucket.openUploadStream(this.getBucketName(options.session).concat('.zip'))),
		);

		await this.deletePrevious(options.session);
	}

	async delete(options: {session: string}): Promise<any> {
		await this.initBucketIfNeccesary(options.session);
		const docs = await this.$bucket.find({
			filename: this.getBucketName(options.session).concat('.zip'),
		}).toArray();

		return Promise.all(docs.map(async doc => this.$bucket.delete(doc._id)));
	}

	protected async deletePrevious(session: string): Promise<void> {
		await this.initBucketIfNeccesary(session);
		const docs = await this.$bucket.find({
			filename: this.getBucketName(session).concat('.zip'),
		}).toArray();

		if (docs.length) {
			const olderSession = docs.reduce((d1, d2) => d1.uploadDate < d2.uploadDate ? d1 : d2);
			if (olderSession) {
				return this.$bucket.delete(olderSession._id);
			}
		}
	}

	protected cleanupSessionString(session: string): string {
		return session.replace(/\s+/g, '_');
	}

	protected getBucketName(session: string): string {
		return 'whatsapp-'.concat(this.cleanupSessionString(session));
	}

	protected async initBucketIfNeccesary(session: string): Promise<void> {
		if (this.$bucket instanceof mongoose.mongo.GridFSBucket) {
			return;
		}

		this.$bucket = new mongoose.mongo.GridFSBucket(this.$mongo.db, {
			bucketName: this.getBucketName(session),
		});
	}
}
