import { prop, getModelForClass } from '@typegoose/typegoose';

class Community {
	@prop({ required: true })
	public name?: string;

	@prop()
	public logo?: string;

	@prop({ required: true, default: 0 })
	public totalPoints?: number;

	@prop({ required: true, default: 0 })
	public totalMembers?: number;


	//members is an array of objects (member is user's email, and timestamp is date joined)
	// @prop({ required: true, select: false, default: [] })
	// public members?: {member?: string, totalPoints?: number, timestamp: Date}[];


}

export const CommunityModel = getModelForClass(Community);
