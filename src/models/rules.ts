import {$mongo} from '@database';
import {Schema} from 'mongoose';

export const rulesModel = $mongo.model('Rules', new Schema({
	_id: Schema.Types.ObjectId,
	type: {
		type: Schema.Types.String,
		enum: ['word', 'url', 'user'],
		required: true,
	},
	name: Schema.Types.String,
	data: Schema.Types.Array,
}, {
	timestamps: true,
}));
