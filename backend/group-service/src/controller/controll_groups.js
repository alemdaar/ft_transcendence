import { db } from '../db.js'

export const createGroup = async (req, res)=>{

	const {name, type, description, memberLimit} = req.body
	const UID = Number(req.user.subject)
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
				ownerID: UID,
				members: {
					create: {
						userID: UID,
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
		res.status(500).json({message: 'Unexpected error, try later...'})
	}
}

export const deleteGroup = async (req, res) => {
	
	if (!/^\d+$/.test(req.params.id)) {
    	return res.status(400).json({ error: "Invalid ID format. Must be a positive number." });
  	}

  	const GID = parseInt(req.params.id, 10);
	const UID = Number(req.user.subject)

	try {
		const group = await db.group.findUnique({ where: {id: GID} })
		if (!group) {
			return res.status(404).json({message: 'group not found !'})
		}
		if (group.ownerID === UID) {
			const deletedGroup = await db.group.delete({
				where: {id: GID}
			})
			return res.status(200).json({message: 'group deleted', deletedGroup})
		}
		return res.status(403).json({message: 'operation requires "owner" role'})
	} catch (error) {
		console.error(error)
		return res.status(500).json({message: 'Unexpected error, try later...'})
	}
}

function buildDiscoverWhere(type, campus, search) {
	let typeConditions
	if (type === 'team') {
		typeConditions = { type: 'team', campus }
	}
	else if (type === 'general') {
		typeConditions = { type: 'general' }
	}
	else {
		typeConditions = {
			OR: [
				{ type: 'general' },
				{ type: 'team', campus }
			]
		}
	}

	if (!search) {
		return typeConditions
	}
	return {
		AND: [
			typeConditions,
			{
				name: {
					contains: search,
					mode: 'insensitive'
				}
			}
		]
	}
}

export const getGroups = async (req, res) => {

	const {scope, type, search} = req.query
	try {
		if (scope === 'mine') {
			// retrieve all membership records for the current user from the member table
			const userMembership = await db.member.findMany({
				where: { userID: Number(req.user.subject) },
				include: { group: true }
			})
	
			/* loop trough the membership array and get only the group 
			 object from it but without ownerID field */
			const groups = userMembership.map(({ group }) => {
				const { ownerID, ...rest } = group
				return rest
			})
	
			return res.status(200).json(groups)
		}
		if (scope === 'discover') {
			
			// Retrieve the user's memberships and the user's pending join requests
			const [memberRows, pendingRows] = await Promise.all([
				db.member.findMany({ where: { userID: Number(req.user.subject) } }),
				db.join_team.findMany({ where: { userID: Number(req.user.subject), status: 'PENDING' } })
			])

			// build two arrays with only the groupIDs from both memberRows and pendingRows
			const memberGroupIds = memberRows.map(row => row.groupID)
			const pendingGroupIds = pendingRows.map(row => row.groupID)
			
			// retrieve all groups based on type and search queries 
			const groups = await db.group.findMany({
				where: buildDiscoverWhere(type, req.user.campus, search),
				include: { _count: { select: { members: true } } },
				omit: { ownerID: true }
			})

			// loop trough all groups and check if it is present in member groupIds array
			// or pending groupIDs array to add viewerStatus depending on it
			const groupsWithStatus = groups.map(group => {
				let viewerStatus = 'none'
				if (memberGroupIds.includes(group.id)) {
					viewerStatus = 'member'
				} else if (pendingGroupIds.includes(group.id)) {
					viewerStatus = 'pending'
				}
				return { ...group, viewerStatus }
			})

			return res.status(200).json(groupsWithStatus)
		}
	
		return res.status(400).json({ error: 'scope must be "mine" or "discover"' })
	} catch (error) {
		console.error(error);
        res.status(500).json({ error: 'Failed to fetch groups' });
	}

}

export const getOneGroup = async (req, res) => {

	const userCampus = req.user.campus

	if (!/^\d+$/.test(req.params.id)) {
    	return res.status(400).json({ error: "Invalid ID format. Must be a positive number." });
  	}

  	const GID = parseInt(req.params.id, 10);

	try {
		const group = await db.group.findUnique({
			where: {
				id: GID
			},
			omit: {
				ownerID: true
			}
		})
		if (group) {
			if (group.type === 'team' && group.campus !== userCampus) {
				return res.status(403).json({error: `You cannot view Team groups from a different campus`})
			}
			return res.status(200).json(group)
		}

		return res.status(404).json({message: `Group not found !`})
	} catch (error) {
		console.error(error)
		return res.status(500).json({error: 'Unexpected error, try later...'})
	}
}
