import {$mongo} from '@database';
import {Schema} from 'mongoose';

export const groupModel = $mongo.model('Group', new Schema({
	_id: Schema.Types.String,
	name: Schema.Types.String,
	owner: Schema.Types.String,
}, {
	timestamps: true,
}));
