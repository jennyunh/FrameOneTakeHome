import express from "express";
import { CommunityModel } from "../models/Community";
import { UserModel } from "../models/User";

const communityRouter = express.Router();






// Common function for the GET communities aggregation pipeline
//function takes a sorting criteria and returns the appropriate aggregation pipeline
//allows for sorting communities by alphetical or descending total points order.
const getCommunities = async (sortCriteria: any) => {
	return await CommunityModel.aggregate([


		//group by id
		//take first name, first logo, first numberOfMembers field encountered for each group of ids
		{
			$group: {
				_id: "$_id",
				name: { $first: "$name" },
				logo: { $first: "$logo" },
				totalPoints: { $first: "$totalPoints" },
				totalMembers: { $first: "$totalMembers" }
			}
		},

		//sort by alphabetical or descending points order
		{
			$sort: sortCriteria
		}
	]);
};




//Aggregation pipeline that takes a month (number)
//and creates an array  of communities with the total points for that month
//the array only shows communities with points for that month (does not show communities with 0 points)

const getPointsByMonth = async (month: number) => {


	return await UserModel.aggregate([

		{
			//get all user documents with a community id.
			$match: {
				communityId: { $ne: "" }
			}
		},

		{

			//flatten the experiencePoints array
			$unwind: {
				path: "$experiencePoints",
			}
		},


		{
			//find all experiencePoints instances with a timestamp of the selected month
			$match: {
				$expr: {
					$eq: [{ $month: "$experiencePoints.timestamp" }, month]
				}
			}
		},

		//group by communityId,
		//totalPoints is the sum of the experiencePoints.points
		{
			$group: {
				_id: "$communityId",
				totalPoints: {
					$sum: "$experiencePoints.points"
				}
			}
		},

		//add a field called objectCommunityId, which is the communityId converted to an objectId
		//to match the type of the community id in the Community Model (which is an objectId).
		{
			$addFields: {
				objectCommunityId: { $toObjectId: "$_id" }
			}
		},

//Add a field called result that is an array that 
//contains the community from Community Model that matches
//the user's community id
		{
			$lookup: {
				from: "communities", 
				localField: "objectCommunityId",
				foreignField: "_id",
				as: "result",
			},
		},

		//flatten the result array
		{
			$unwind: "$result",
		},

		//add the following fields
		{
			$addFields: {
				name: "$result.name",
				logo: "$result.logo",
				totalMembers: "$result.totalMembers"
			}
		},
	
	//sort by totalPoints (descending)
		{
		$sort: {
			totalPoints: -1
			}
	},

	//final result should show:
	{
		$project: {
			name: 1,
			logo: 1,
			totalMembers: 1,
			totalPoints: 1,
			_id: 1
			}
	}
	]);
}





/**
 * @route GET /community/bymonth?month=5
 * @param {number} month - month
 * @returns {Array} - array of Community objects with total number of points for that month
 */

communityRouter.get("/bymonth", async (req, res) => {

	try {
		const month = Number(req.query.month);

		//if the month number is not between 1 and 12 (inclusive)
		if (!month || month < 1 || month > 12) {
			return res.status(400).send({ message: "Invalid month value" });
		}

		//run the getPointsByMonth aggregation
		const pointsByMonth = await getPointsByMonth(month);

		res.send(pointsByMonth);


	} catch (error) {
		console.error(error);
		res.status(500).send({ message: "Internal Server Error" });
	}


});








/*
 * @route GET /community/ascending
 * @returns {Array} - array of Community objects in ALPHABETICAL order
 */
communityRouter.get("/alphabetical", async (_, res) => {
	try {
		const communities = await getCommunities({ name: 1 });
		res.send(communities);
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: "Internal Server Error" });
	}
});




/*
* @route GET /community/ranked
* @returns {Array} - array of Community objects in DESCENDING total points order
*/
communityRouter.get("/ranked", async (_, res) => {
	try {
		const communities = await getCommunities({ totalPoints: -1, totalMembers: -1 });
		res.send(communities);
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: "Internal Server Error" });
	}


});




/**
 * @route GET /community/:id
 * @param {string} id - Community ID
 * @returns {Community} - Community object
 */
communityRouter.get("/:id", async (req, res) => {


	const community = await CommunityModel.findById(req.params.id).lean();


	if (!community) {
		return res.status(404).send({ message: "Community not found" });
	}


	res.send(community);
});




export {
	communityRouter
}


