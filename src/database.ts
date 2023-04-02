import mongoose from 'mongoose';

export const $mongo: mongoose.Connection = mongoose.createConnection(
	process.env.MONGODB_URI ?? 'mongodb://localhost:27017',
	{
		dbName: 'wacaa',
	},
);
