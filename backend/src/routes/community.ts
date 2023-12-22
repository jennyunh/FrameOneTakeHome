import express from "express";
import { CommunityModel } from "../models/Community";


const communityRouter = express.Router();



// Common function for the GET communities aggregation pipeline
//function takes a sorting criteria and returns the appropriate aggregation pipeline
//allows for sorting communities by alphetical or descending total points order.
const getCommunities = async (sortCriteria: any) => {
	return await CommunityModel.aggregate([

		//add a field "numberOfMembers": counts how many members objects are in the members array
		{
			$addFields: {
				numberOfMembers: {
					$size: {
						$ifNull: ["$members", []]
					}
				}
			}
		},


		//flatten by creating doc for every members object
		{
			$unwind: {
				path: "$members",
				preserveNullAndEmptyArrays: true
			}
		},

		//group by id
		//take first name, first logo, first numberOfMembers field encountered for each group of ids
		{
			$group: {
				_id: "$_id",
				name: { $first: "$name" },
				logo: { $first: "$logo" },
				totalPoints: { $sum: "$members.totalPoints" },
				numberOfMembers: { $first: "$numberOfMembers" }
			}
		},

		//sort by alphabetical or descending points order
		{
			$sort: sortCriteria
		}
	]);
};



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
* @route GET /community/descending
* @returns {Array} - array of Community objects in DESCENDING total points order
*/
communityRouter.get("/ranked", async (_, res) => {
	try {
		const communities = await getCommunities({ totalPoints: -1 });
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


