import express from "express";
import { UserModel } from "../models/User";
import { CommunityModel } from "../models/Community";

const userRouter = express.Router();

/**
 * @route GET /user/:id
 * @param {string} id - User ID
 * @returns {User} - User object with experiencePoints field
 */
userRouter.get("/:id", async (req, res) => {
	const user = await UserModel.findById(req.params.id).select('+experiencePoints');

	if (!user) {
		return res.status(404).send({ message: "User not found" });
	}

	res.send(user);
});





/**
 * @route GET /user
 * @returns {Array} - Array of User objects
 * @note Adds the virtual field of totalExperience to the user.
 * @hint You might want to use a similar aggregate in your leaderboard code.
 */
userRouter.get("/", async (_, res) => {
	const users = await UserModel.aggregate([
		{
			$unwind: "$experiencePoints"
		},
		{
			$group: {
				_id: "$_id",
				email: { $first: "$email" },
				profilePicture: { $first: "$profilePicture" },
				communityName: { $first: "$communityName" },
				totalExperience: { $sum: "$experiencePoints.points" }
			}
		}

	]);
	res.send(users);
});






/**
 * @route POST /user/:userId/join/:communityId
 * @param {string} userId - User ID
 * @param {string} communityId - Community ID
 * @description Joins a community
 */

userRouter.post("/:userId/join/:communityId", async (req, res) => {
	const { userId, communityId } = req.params;


	//FIND the user and community by id in the database
	const user = await UserModel.findById(userId).select('+experiencePoints');
	const community = await CommunityModel.findById(communityId).select("+members");


	//ERROR if no user found
	if (!user) {
		return res.status(404).send({ message: "User not found" });
	}

	//ERROR if no community found
	if (!community) {
		return res.status(404).send({ message: "Community not found" });
	}

	const userPoints = user.experiencePoints?.reduce((total, experience) => total + experience.points, 0);





	//IF user has NOT joined a community, let them join a community
	if (!user.communityName) {

		//update the user's community name field
		await UserModel.findByIdAndUpdate(userId, { communityName: community.name })


		//! tells TS that members array will exist (empty array by default)
		let arr = community.members!

		//push a new member onto the members array
		arr.push({ member: user.email, totalPoints: userPoints, timestamp: new Date() })

		//add member to the new community's members array
		await CommunityModel.findByIdAndUpdate(communityId, { members: arr })


		//SUCCESS
		return res.status(200).send()
	}


	//else if the user does have a community 
	else if (user.communityName) {

		let oldCommunity = user.communityName;

		//delete the member from the old community's members list
		await CommunityModel.updateOne(
			{ name: oldCommunity },
			{ $pull: { members: { member: user.email } } }
		);

		//update the user's community name field with the new community name
		await UserModel.findByIdAndUpdate(userId, { communityName: community.name })


		//! tells TS that members array will not be undefined
		let arr = community.members!

		//push a new member onto the members array
		arr.push({ member: user.email, timestamp: new Date() })

		//add member to the new community's members array.
		await CommunityModel.findByIdAndUpdate(communityId, { members: arr })


		//SUCCESS
		return res.status(200).send()

	}

	//catcher "Not Implemented server error"
	res.status(501).send();
});









/**
 * @route DELETE /user/:userId/leave/:communityId
 * @param {string} userId - User ID
 * @param {string} communityId - Community ID
 * @description leaves a community
 */
userRouter.delete("/:userId/leave/:communityId", async (req, res) => {
	const { userId, communityId } = req.params;

	//FIND the user id and community id in the database
	const user = await UserModel.findById(userId).select('+experiencePoints');
	const community = await CommunityModel.findById(communityId).select("+members");

	//ERROR if no user found
	if (!user) {
		return res.status(404).send({ message: "User not found" });
	}

	//ERROR if no community found
	if (!community) {
		return res.status(404).send({ message: "Community not found" });
	}



	//if user has joined a community
	if (user?.communityName) {

		//make the user's community name to a blank string ""
		await UserModel.findByIdAndUpdate(userId, { communityName: "" })

		//wipe out the user's experience points for that community
		await UserModel.findByIdAndUpdate(userId, { experiencePoints: [] })


		let memberToDelete = user.email;


		//update the community's members array by pulling out the member to delete.
		await CommunityModel.findByIdAndUpdate(communityId, { $pull: { members: { member: memberToDelete } } })


		//SUCCESS
		return res.status(200).send();


	}


	//catcher "Not Implemented server error"
	res.status(501).send();
});



export {
	userRouter
}
