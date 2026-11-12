import { tr } from 'zod/locales'
import {db} from '../db.js'

export const joinGeneralGroup = async (req, res) => {

	const UID = Number(req.user.subject)
  	const GID = req.validated.params.id

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
	const GID = req.validated.params.id;
	const UID = Number(req.user.subject);
	const UserCampus = req.user.campus;

	try {
		const [group, existingMember, pendingRequest] = await Promise.all([
			db.group.findUnique({
				where: { id: GID },
				include: { _count: { select: { members: true } } }
			}),
			db.member.findFirst({ where: { groupID: GID, userID: UID } }),
			db.join_team.findFirst({ where: { groupID: GID, userID: UID, status: 'PENDING' } })
		])

		if (!group) {
			return res.status(404).json({ error: 'Group not found !' })
		}
		if (group.type === 'general') {
			return res.status(400).json({ error: 'Group type must be team !' })
		}
		if (group.campus !== UserCampus) {
			return res.status(403).json({ error: 'You can only request to join team groups from your own campus.' })
		}
		if (group._count.members >= group.memberLimit) {
			return res.status(409).json({ error: 'The group has reached its member limit.' })
		}
		if (existingMember) {
			return res.status(409).json({ error: 'You are already a member in this group.' })
		}
		if (pendingRequest) {
			return res.status(409).json({ error: 'You already have a PENDING request to join this group.' })
		}

		await db.join_team.create({
			data: {
				groupID: GID,
				userID: UID,
				status: 'PENDING'
			}
		})
		return res.status(201).json({ message: "Join request sent successfully. Waiting for owner approval." })
	} catch (error) {
		console.error(error)
		return res.status(500).json({ error: 'Unexpected error, try later...' })
	}
}

//\\ still Need B1 
export const getPendingRequest = async (req, res) => {
	const GID = req.validated.params.id
	const UID = Number(req.user.subject)

	try {
		const group = await db.group.findUnique({
				where: {
					id: GID
				},
				include: {
					joinTeams :{
						select: {
							id: true,
							userID: true,
							requestedAt: true
						}
					}
				}
			})

		if (!group) {
			return res.status(404).json({ error: 'Group not found !' })
		}
		if (group.type !== 'team') {
			return res.status(400).json({ error: 'Group type must be team !' })
		}
		if (group.ownerID !== UID) {
			return res.status(403).json({error: `operation requires "owner" role`})
		}
		return res.status(200).json({data: group.joinTeams})
	} catch (error) {
		console.error(error)
		return res.status(500).json({error: 'Unexpected error, try later...'})
	}
}

export const getGroupMembers = async (req, res) => {
	const GID = req.validated.params.id

	try {
		const group = await db.group.findUnique({
			where: {
				id: GID
			},
			include: {
				members: {
					select: {
						id: true,
						userID: true,
						role: true,
						joinedAt: true
					}
				}
			}
		})
		if (!group) {
			return res.status(400).json({error: "group npt found !"})
		}
		return res.status(200).json({data: group.members})
	} catch (error) {
		console.error(error)
		return res.status(500).json({error: 'Unexpected error, try later...'})
	}
}
///////////////////////////////////////////////////////////////////////

export const approveTeamJoin = async (req, res) => {
	const GID = req.validated.params.id
	const UID = Number(req.user.subject)
	const requestId = req.validated.params.requestId

	try {
		const [group, currentUserMembership] = await Promise.all([
			db.group.findUnique({
				where: { id: GID },
				include: { _count: { select: { members: true } } }
			}),
			db.member.findFirst({
				where: { groupID: GID, userID: UID }
			})
		])

		if (!group) {
			return res.status(404).json({error: 'group not found !'})
		}
		if (group.type !== 'team') {
			return res.status(403).json({error: 'operation requires "team" group'})
		}
		
		if (group._count.members >= group.memberLimit) {
			return res.status(409).json({error: 'Cannot approve request. The group has reached its member limit.'})
		}

			
		if (group.ownerID != UID) {
			return res.status(403).json({error: `operation requires "owner" role`})
		}

		await db.$transaction(async (tx) => {
			const request = await tx.join_team.update({
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
					userID: request.userID,
					role: 'MEMBER'
				}
			})
		})
		
		return res.status(200).json({message: 'Join request approved successfully. User is now a member.'})
		
	} catch (error) {
		console.error(error)
		if (error.code === 'P2025') {
			return res.status(404).json({error: 'Join-request not found or has already been processed.'})
		}
		return res.status(500).json({error: 'Unexpected error, try later...'})
	}
}