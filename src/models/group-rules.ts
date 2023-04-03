import {$mongo} from '@database';
import {Schema} from 'mongoose';

export const groupRulesModel = $mongo.model('GroupRules', new Schema({
	group: {
		type: Schema.Types.ObjectId,
		ref: 'Group',
	},
	rule: {
		type: Schema.Types.ObjectId,
		ref: 'Rules',
	},
}));
