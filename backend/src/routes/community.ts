import express from "express";
import { CommunityModel } from "../models/Community";


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
		const communities = await getCommunities({ totalPoints: -1 });
		res.send(communities);
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: "Internal Server Error" });
	}


});


/**
 * @route GET /community/:month
 * @param {number} month - Community ID
 * @returns {Array} - array of Community objects with total number of points for that month
 */




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


