import { db } from "../db.js"

export const getOneGroup = async (req, res) => {

	const groupId = Number(req.params.id)

	if (!Number.isInteger(groupId)) {
		return res.status(400).json({ error: "Invalid ID format. Must be a number." });
	}

	try {
		const group = await db.group.findUnique({
			where: {
			id: groupId
			},
			omit: {
				ownerID: true
			}
		})
		if (group) {
			return res.status(200).json(group)
		}
		return res.status(404).json({message: `Group not found !`})
	} catch (error) {
		console.error(error)
		return res.status(500).json({error: `Unexpected error !`})
	}
}
