import {Schema, model} from 'mongoose';

export const groupModel = model('Group', new Schema({
	_id: Schema.Types.String,
	name: Schema.Types.String,
	owner: Schema.Types.String,
}, {
	timestamps: true,
}));
