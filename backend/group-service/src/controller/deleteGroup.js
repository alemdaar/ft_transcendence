import { db } from "../db.js";

export const deleteGroup = async (req, res) => {
	const groupID = Number(req.params.id)

	if (!Number.isInteger(groupID)) {
		return res.status(400).json({ error: "Invalid ID format. Must be a number." });
	}

	try {
		const group = await db.group.findUnique({ where: {id: Number(groupID)} })
		if (!group) {
			return res.status(404).json({message: 'group not found !'})
		}
		if (group.ownerID === Number(req.user.subject)) {
			const deletedGroup = await db.group.delete({
				where: {id: Number(groupID)}
			})
			return res.status(200).json({message: 'group deleted', deletedGroup})
		}
		return res.status(403).json({message: 'operation requires "owner" role'})
	} catch (error) {
		console.error(error)
		return res.status(500).json({message: 'Unexpected error !'})
	}
}
