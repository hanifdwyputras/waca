import {Schema, model} from 'mongoose';

export const groupRulesModel = model('GroupRules', new Schema({
	group: {
		type: Schema.Types.ObjectId,
		ref: 'Group',
	},
	rule: {
		type: Schema.Types.ObjectId,
		ref: 'Rules',
	},
}));
