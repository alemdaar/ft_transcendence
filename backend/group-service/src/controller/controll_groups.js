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
		res.status(500).json({error: 'Unexpected error, try later...'})
	}
}

function FilterAndSearch(type, campus, search) {

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

const pagination = (page) => {
	const pageNumber = page || 1
	const LIMIT = 6
	const skiprecord = (pageNumber - 1) * LIMIT
	return {LIMIT, skiprecord, pageNumber}
}

const buildPaginationObj = (page, totalGroups) => {
	const totalPages = Math.ceil(totalGroups / page.LIMIT)
	return {
    "currentPage": page.pageNumber,
    "limit": page.LIMIT,
    "totalGroups": totalGroups,
    "totalPages": totalPages,
    "hasPrevPage": page.pageNumber > 1 ? true : false,
    "hasNextPage": page.pageNumber < totalPages ? true : false
  }
}

const PaginateGroups = async (conditions, page) => {
	const [groups, totalGroups] = await Promise.all([
		db.group.findMany({
			where: conditions,
			omit: {ownerID: true},
			include: {_count: {select: {members: true}}},
			take: page.LIMIT,
			skip: page.skiprecord,
			orderBy: {createdAt: 'desc'}
		}),
		db.group.count({
			where: conditions
		})
	])
	const paginationInfo = buildPaginationObj(page, totalGroups)
	return {
		data: groups,
		pagination: paginationInfo
	}
}

export const getGroups = async (req, res) => {

	const UID = Number(req.user.subject)
	const page = pagination(req.validated.query.page)
	if (page.error)
		return res.status(400).json(page);

	const scope = req.query.scope
	try {
		if (scope === 'mine' || scope === 'pending') {
			const GroupCondition = scope === 'mine' ? {members : {some: { userID: UID }}} : {joinTeams : {some: { userID: UID, status: 'PENDING'}}}
			const result = await PaginateGroups(GroupCondition, page)
			return res.status(200).json(result)
		}
		if (scope === 'discover') {
			if (req.query.type !== undefined 
			&& req.query.type !== 'team' 
			&& req.query.type !== 'general') {
				return {error: 'type must be team or general'}
			}
			const {type, search, sort} = req.query
			// retrieve all groups based on type and search queries
			const GroupCondition = {
				AND: [
					{members: {none: {userID: Number(req.user.subject)}}},
					{joinTeams: {none: {userID: Number(req.user.subject)}}},
					FilterAndSearch(type, req.user.campus, search)
				]
			}
			const result = await PaginateGroups(GroupCondition, page)

			return res.status(200).json(result)
		}
		return res.status(400).json({ error: 'scope must be "mine" or "discover"' })
	} catch (error) {
		console.error(error);
        res.status(500).json({ error: 'Failed to fetch groups' });
	}
	
}

export const getOneGroup = async (req, res) => {
	const userCampus = req.user.campus
	const GID = req.validated.params.id
	
	try {
		const group = await db.group.findUnique({
			where: {
				id: GID
			},
			omit: {
				ownerID: true
			},
			include: {_count: {select: {members: true}}}
		})
		if (group) {
			if (group.type === 'team' && group.campus !== userCampus) {
				return res.status(403).json({error: `You cannot view Team groups from a different campus`})
			}
			return res.status(200).json(group)
		}
		return res.status(404).json({error: `Group not found !`})
	} catch (error) {
		console.error(error)
		return res.status(500).json({error: 'Unexpected error, try later...'})
	}
}

export const deleteGroup = async (req, res) => {

	const GID = req.validated.params.id
	const UID = Number(req.user.subject)

	try {
		const group = await db.group.findUnique({
			where: {
				id: GID
			}
		})
		if (!group) {
			return res.status(404).json({error: 'group not found !'})
		}
		if (group.ownerID === UID) {
			const deletedGroup = await db.group.delete({
				where: {
					id: GID
				},
				omit: {
					ownerID: true
				}
			})
			return res.status(200).json({message: 'group deleted', deletedGroup})
		}
		return res.status(403).json({error: 'operation requires "owner" role'})
	} catch (error) {
		console.error(error)
		if (error.code === 'P2025') {
			return res.status(404).json({error: 'group not found !'})
		}
		return res.status(500).json({error: 'Unexpected error, try later...'})
	}
}
