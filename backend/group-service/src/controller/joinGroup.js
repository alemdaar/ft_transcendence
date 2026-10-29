import {db} from '../db.js'

export const joinGeneralGroup = async (req, res) => {

    const UID = Number(req.user.subject)
    if (!/^\d+$/.test(req.params.id)) {
    	return res.status(400).json({ error: "Invalid ID format. Must be a positive number." });
  	}

  	const GID = parseInt(req.params.id, 10);

    try {
        
        const group = await db.group.findUnique({
            where: {
                id: GID
            },
            include: {
                members: true
            }
        })
		// check if the group exists
        if (!group) {
        	return res.status(404).json({error: `Group not found !`})
        }

		// check if the group not a team group
        if (group.type === 'team') {
            return res.status(400).json({error: `Group type must be general !`})
        }

		// check if the user is not member in the group
        if (group.members.some((member) => member.userID === UID)) {
            return res.status(409).json({error: 'User is already a member'})
        }

		// add the user as member in the group
        await db.member.create({
            data: {
                groupID: GID,
                userID: UID,
                role: 'MEMBER',
            }
        })
        res.status(201).json({message: "Successfully joined the group."})
    } catch (error) {
        console.log(error)
        res.status(500).json({error: 'Unexpected error, try later...'})
    }
}

export const joinTeamGroup = async (req, res) => {

	if (!/^\d+$/.test(req.params.id)) {
		return res.status(400).json({ error: "Invalid ID format. Must be a positive number." });
  	}

  	const GID = Number(req.params.id)
	const UID = Number(req.user.subject)
	const UserCampus = req.user.campus

	try {
		
		const group = await db.group.findUnique({
			where: {
				id: GID
			},
			include: {
				members: true,
				joinTeams: true
			}
		})

		if (!group) {
			return res.status(404).json({error: `Group not found !`})
		}
		if (group.type === 'general') {
			return res.status(400).json({error: `Group type must be team !`})
		}
		if (group.campus !== UserCampus) {
			return res.status(403).json({error: `You can only request to join team groups from your own campus.`})
		}
		if (group.members.some((member) => member.userID === UID)) {
			return res.status(409).json({error: 'you are already a member in this group.'})
		}
		if (group.joinTeams.some((join) => join.userID === UID && join.status === 'PENDING'))
			return res.status(409).json({error: 'you have already a PENDING request to join this group.'})

		await db.join_team.create({
			data: {
				groupID: GID,
				userID: UID,
				status: 'PENDING'
			}
		})
		res.status(201).json({message: "Join request sent successfully. Waiting for owner/admin approval."})
	} catch (error) {
		console.log(error)
		res.status(500).json({error: 'Unexpected error, try later...'})
	}
}

export const approveTeamJoin = async (req, res) => {
    if (!/^\d+$/.test(req.params.id)
        || !/^\d+$/.test(req.params.requestId)) {
		return res.status(400).json({ error: "Invalid ID or requestId format. Must be a positive number." });
  	}
    
    const GID = Number(req.params.id)
	const UID = Number(req.user.subject)
    const requestId = Number(req.params.requestId)

	try {
		const group = await db.group.findUnique({
			where: {
				id: GID
			},
			include: {
				members: true
			}
		})

		// check if the group exists
		if (!group) {
			return res.status(404).json({error: 'group not found !'})
		}
		
		// check if the group type is team
		if (group.type !== 'team') {
			return res.status(403).json({error: 'operation requires "team" group'})
		}
		
		// check if the groub hase an empty place
		if (group.members.length() === group.memberLimit) {
			return res.status(409).json({error: 'Cannot approve request. The group has reached its member limit.'})
		}

		// check if the user is the group owner
		if (group.ownerID !== UID) {
			return res.status(403).json({error: 'operation requires "owner" role'})
		}

		// update the join request status to accepted and add the user as member in the group
		await db.$transaction(async (tx)=>{
			await tx.join_team.update({
				where: {
					id: requestId,
					status: 'PENDING'
				},
				data: {
					status: 'ACCEPTED'
				}
			})
	
			await tx.member.create({
				data: {
					groupID: GID,
					userID: UID,
					role: 'MEMBER'
				}
			})
		})
		return res.status(200).json({message: 'Join request approved successfully. User is now a member.'})
	} catch (error) {
		if (error.code === 'P2025')
			return res.status(404).json({error: 'Join-request not found or has already been processed.'})
		return res.status(500).json({error: 'Unexpected error, try later...'})
	}
	
}
