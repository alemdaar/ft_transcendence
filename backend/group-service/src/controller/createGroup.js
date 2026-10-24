import { db } from '../db.js'

export const createGroup = async (req, res)=>{
	const {name, type, description, memberLimit} = req.body
	const tokenID = Number(req.user.subject)
	const userCampus = req.user.campus
	try {
		const group = await db.group.create({
			data:
			{
				name: name,
				type: type,
				description: description,
				campus: userCampus,
				memberLimit: memberLimit,
				ownerID: tokenID,
				members: {
					create: {
						userID: tokenID,
						role: "OWNER"
					}
				}
			},
			omit: {
				ownerID: true
			}
		})
		console.log("group created:\n", group)
		res.status(201).json({message: `Groupe created`, group})
	} catch (error) {
		console.error(error)
		res.status(500).json({message: `Unexpected error`})
	}
}
