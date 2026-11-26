import {db} from '../db.js'
import AppError from '../utils/AppError.js'

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
                    },
                    orderBy: {id: 'asc'}
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
        const PendingWithProfiles = await fetchProfiles(group.joinTeams)
        return res.status(200).json(PendingWithProfiles)
    } catch (error) {
        console.error(error)
        return res.status(500).json({error: 'Unexpected error, try later...'})
    }
}

const fetchProfiles = async (members) => {
    const ArrayIds = members.map(member => member.userID)
    try {
        const response = await fetch('http://localhost:3000/users/batch', {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({"ids": ArrayIds})
        })
        if (!response.ok) {
            throw new Error("response not OK")
        }
        const profiles = await response.json()
        if (profiles?.length === 0) {
            throw new Error("No Profile found")
        }
        console.log(profiles)
        const MembersWithProfiles = members.map((member) => {
            const currentProfile = profiles.find(pr=>pr.id === member.userID) 
            || {"id":`${member.userID}`,"username":"Unknown user","avatarUrl":null}
            return {...member, profile: currentProfile}
        })
        return {ProfilesLoaded: true, data: MembersWithProfiles}
    } catch (error) {
        console.error(error)
        return {ProfilesLoaded: false, data: members}
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
                    },
                    orderBy: {id: 'asc'}
                }
            }
        })
        if (!group) {
            return res.status(400).json({error: "group not found !"})
        }
        const MembersWithProfiles = await fetchProfiles(group.members)
        return res.status(200).json(MembersWithProfiles)
    } catch (error) {
        console.error(error)
        return res.status(500).json({error: 'Unexpected error, try later...'})
    }
}

export const approveTeamJoin = async (req, res) => {
    const GID = req.validated.params.id
    const UID = Number(req.user.subject)
    const requestId = req.validated.params.requestId
    const code = "GSP123"

    try {
        await db.$transaction(async (tx) => {
            const result = await tx.$queryRaw`
                SELECT *
                FROM "Group"
                WHERE id = ${GID}
                FOR UPDATE
            `
            const group = result[0]
            const groupMemberCount = await tx.member.count({
                where: {
                    groupID: GID
                }
            })
            if (!group)
                throw new AppError('group not found !', 404, code)
            if (group.type === 'general')
                throw new AppError('operation requires "team" group', 403, code)
            if (groupMemberCount >= group.memberLimit)
                throw new AppError('Cannot approve request. The group has reached its member limit.',
                    409, code)
            if (group.ownerID !== UID)
            {
                console.log('group.ownerID: ', group.ownerID, ' UID: ', UID)
                throw new AppError(`operation requires "owner" role`, 403, code)
            }
            const request = await tx.join_team.update({
                where: {
                    id: requestId,
                    groupID: GID,
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
        
        return res.status(201).json({message: 'Join request approved successfully. User is now a member.'})
        
    } catch (error) {
        console.error(error)
        if (error.code === 'P2025')
            return res.status(404).json({error: 'Join-request not found or has already been processed.'})
        if (error.code === code) {
            return res.status(error.statusCode).json({error: error.message})
        }
        return res.status(500).json({error: 'Unexpected error, try later...'})
    }
}

export const rejectTeamJoin = async (req, res) => {
    const GID = req.validated.params.id
    const UID = Number(req.user.subject)
    const requestId = req.validated.params.requestId

    try {
        const group = await db.group.findUnique({
            where: {
                id: GID
            }
        })
        if (!group) {
            return res.status(404).json({error: 'group not found !'})
        }
        if (group.type !== 'team') {
            return res.status(403).json({error: 'operation requires "team" group'})
        }
        if (group.ownerID != UID) {
            return res.status(403).json({error: `operation requires "owner" role`})
        }
        const request = await db.join_team.update({
            where: {
                id: requestId,
                groupID: GID,
                status: 'PENDING'
            },
            data: {
                status: 'REJECTED'
            }
        })
        res.status(201).json({message: 'Join request rejected successfully.'})
    } catch (error) {
        console.error(error)
        if (error.code === 'P2025') {
            return res.status(404).json({error: 'Join-request not found or has already been processed.'})
        }
        return res.status(500).json({error: 'Unexpected error, try later...'})
    }
}


