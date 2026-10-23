import { db } from '../db.js'

export const createGroup = async (req, res)=>{
	const {name, type, description, memberLimit} = req.body
	
	try {
		const group = await db.group.create({
			data:
			{
				name: name,
				type: type,
				description: description,
				campus: req.user.campus,
				memberLimit: memberLimit,
				ownerID: Number(req.user.subject)
			}
		})
		console.log("group created:\n", group)
		res.status(201).json({message: `Groupe created`, group})
	} catch (error) {
		console.error(error)
		res.status(500).json({message: `Unexpected error`})
	}
}
