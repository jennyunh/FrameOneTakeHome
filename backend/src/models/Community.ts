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


	/*CHANGES TO DATA STRUCTURE: 

	- got rid of array of members
	- members are now linked to community via the community id.


	CHANGES TO FRONT END:
	- memoized the leaderboard since we don't want to re-render the leaderboard every time the parent renders
	- also memoized the monthselect component
	(so the selected option doesn't disappear due to an unnecessary render)
	
	POTENTIAL IMPROVEMENTS:
	- For scalability, the experience points of a user can be in a different model. 
	So that every instance of experience points can be a new doc instead of adding to an array.
	
	- Code for recalculating total points when user joins or leaves community (in user.ts) is repetitive.
	Can make one aggregation function for them.
	
	- Scalability of leaderboard: need pagination
	
	- Unnecessary render: the handleJoinClick and handleLeaveClick handlers
	for the DarkUserCommunitySelect component
	is recreated everytime the parent component renders.
	Can useCallBack, but the re-rendering of this component is not a huge performance issue.
	*/



	/* GOT RID OF THIS */
	//members is an array of objects (member is user's email, and timestamp is date joined)
	// @prop({ required: true, select: false, default: [] })
	// public members?: {member?: string, totalPoints?: number, timestamp: Date}[];


}

export const CommunityModel = getModelForClass(Community);
