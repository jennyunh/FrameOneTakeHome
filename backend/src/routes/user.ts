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
			$unwind: {
				path: "$experiencePoints",
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$group: {
				_id: "$_id",
				email: { $first: "$email" },
				profilePicture: { $first: "$profilePicture" },
				communityId: { $first: "$communityId" },
				totalExperience: { $sum: "$experiencePoints.points" }
			}
		},

		//alphabetical order
		{ $sort: { email: 1 } }

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

	//ERROR if no user found
	if (!user) {
		return res.status(404).send({ message: "User not found" });
	}

	//IF user has NOT joined a community, let them join a community
	if (!user.communityId) {

		//update the user's community id field
		await UserModel.findByIdAndUpdate(userId, { communityId: communityId })


		//recalculate total members for the community data
		await CommunityModel.findByIdAndUpdate(communityId,
			{ $inc: { totalMembers: 1 } })


		//recalculate total points for the new community
		const aggregateResult = await UserModel.aggregate([
			{
				$match: { communityId: communityId } // Match users belonging to the specific community
			},
			{
				$unwind: {
					path: "$experiencePoints", // Unwind the experiencePoints array
					preserveNullAndEmptyArrays: true
				}  // create a doc if array is empty
			},
			{
				$group: {
					_id: null,
					totalPoints: { $sum: "$experiencePoints.points" } // Sum up experiencePoints for all users
				}
			}
		]);


		//update new community's total points
		if (aggregateResult[0]) {

			await CommunityModel.findByIdAndUpdate(
				communityId,
				{ totalPoints: aggregateResult[0].totalPoints }
			)


			//no points
		} else {
			await CommunityModel.findByIdAndUpdate(
				communityId,
				{ totalPoints: 0 }
			)

		}


		//SUCCESS
		return res.status(200).send()
	}



	//else if the user does have a community 
	else if (user.communityId) {

		let oldCommunity = user.communityId;

		//recalculate total members for old community
		await CommunityModel.findByIdAndUpdate(oldCommunity,
			{ $inc: { totalMembers: -1 } })


		//update the user's community id field with the new community id
		await UserModel.findByIdAndUpdate(userId, { communityId: communityId })



		//recalculate total points for the old community
		const oldTotalPoints = await UserModel.aggregate([
			{
				$match: { communityId: oldCommunity } // Match users belonging to the specific community
			},
			{
				$unwind: "$experiencePoints" // Unwind the experiencePoints array
			},
			{
				$group: {
					_id: null,
					totalPoints: { $sum: "$experiencePoints.points" } // Sum up experiencePoints for all users
				}
			}
		]);


		//update old community's total points
		if (oldTotalPoints[0]) {

			await CommunityModel.findByIdAndUpdate(
				oldCommunity,
				{ totalPoints: oldTotalPoints[0].totalPoints }
			)

			//case for no points
		} else {
			await CommunityModel.findByIdAndUpdate(
				oldCommunity,
				{ totalPoints: 0 }
			)

		}



		//recalculate total members for the new community
		await CommunityModel.findByIdAndUpdate(communityId,
			{ $inc: { totalMembers: 1 } })


		//recalculate total points for the new community
		const newTotalPoints = await UserModel.aggregate([
			{
				$match: { communityId: communityId } // Match users belonging to the specific community
			},
			{
				$unwind: {
					path: "$experiencePoints",
					preserveNullAndEmptyArrays: true //create doc for user with empty experiencePoints array
				}
			},
			{
				$group: {
					_id: null,
					totalPoints: { $sum: "$experiencePoints.points" } // Sum up experiencePoints for all users
				}
			}
		]);



		//update new community's total points
		if (newTotalPoints[0]) {

			await CommunityModel.findByIdAndUpdate(
				communityId,
				{ totalPoints: newTotalPoints[0].totalPoints }
			)

		} else {

			await CommunityModel.findByIdAndUpdate(
				communityId,
				{ totalPoints: 0 }
			)

		}

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
	const community = await CommunityModel.findById(communityId);

	//ERROR if no user found
	if (!user) {
		return res.status(404).send({ message: "User not found" });
	}

	//ERROR if no community found
	if (!community) {
		return res.status(404).send({ message: "Community not found" });
	}



	//if user has joined a community
	if (user.communityId) {

		//recalculate the old community's totalMembers
		await CommunityModel.findByIdAndUpdate(communityId,
			{ $inc: { totalMembers: -1 } })


		//wipe out the user's experience points for that community
		await UserModel.findByIdAndUpdate(userId, { experiencePoints: [] })


		//update the user's community id
		await UserModel.findByIdAndUpdate(userId, { communityId: "" })

		//recalculate total points for the old community
		const updatedTotalPoints = await UserModel.aggregate([
			{
				$match: {
					communityId: communityId,
					_id: { $ne: userId }
				} // Match users belonging to the specific community
			},
			{
				$unwind: "$experiencePoints"
			},
			{
				$group: {
					_id: null,
					totalPoints: { $sum: "$experiencePoints.points" } // Sum up experiencePoints for all users
				}
			}
		]);

		if (updatedTotalPoints[0]) {
			await CommunityModel.findByIdAndUpdate(
				communityId,
				{ totalPoints: updatedTotalPoints[0].totalPoints }
			)

		} else {
			await CommunityModel.findByIdAndUpdate(
				communityId,
				{ totalPoints: 0 }
			)

		}


		//SUCCESS
		return res.status(200).send();


	}


	//catcher "Not Implemented server error"
	res.status(501).send();
});



export {
	userRouter
}
