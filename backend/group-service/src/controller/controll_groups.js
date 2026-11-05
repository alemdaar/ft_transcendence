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

const discoverGroup = async (req, page) => {

	return groups
}

const pagination = (page) => {

	let pageNumber = 1
	if (page !== undefined) {
		pageNumber = Number(page)
		if (!/^\d+$/.test(page) || pageNumber < 1)
			return {error: "Page must be a positif number."}
		if (!Number.isSafeInteger(pageNumber))
			return {error: "number too big."}
	}

	const LIMIT = 4
	const skiprecord = (pageNumber - 1) * LIMIT
	return {LIMIT, skiprecord, pageNumber}
}

const buildPaginationObj = (page, goupsLength) => {
	return {
    "currentPage": page.pageNumber,
    "limit": page.LIMIT,
    "totalGroups": goupsLength,
    "totalPages": goupsLength / page.LIMIT,
    "hasPrevPage": page.pageNumber > 1 ? true : false,
    "hasNextPage": page.pageNumber < totalPages ? true : false
  }
}

export const getGroups = async (req, res) => {

	const UID = Number(req.user.subject)
	const page = pagination(req.query.page)
	if (page.error)
		return res.status(400).json(page);

	const scope = req.query.scope
	try {
		if (scope === 'mine' || scope === 'pending') {
			const GroupCondition = scope === mine ? {members : {some: { userID: UID }}} : {joinTeams : {some: { userID: UID }}}
			const groups = await db.group.findMany({
				where: GroupCondition,
				omit: {ownerID: true},
				include: {_count: {select: {members: true}}},
				take: page.LIMIT,
				skip: page.skiprecord,
				orderBy: {createdAt: 'desc'}
			})
			const paginationInfo = buildPaginationObj(page, groups.length)
			return res.status(200).json({"data": groups, "pagination": paginationInfo})
		}
		if (scope === 'discover') {
			if (req.query.type !== undefined 
			&& req.query.type !== 'team' 
			&& req.query.type !== 'general') {
				return {error: 'type must be team or general'}
			}
				const {type, search, sort} = req.query
				// retrieve all groups based on type and search queries
				const groups = await db.group.findMany({
					where: {
						AND: [
							{members: {none: {userID: Number(req.user.subject)}}},
							{joinTeams: {none: {userID: Number(req.user.subject)}}},
							FilterAndSearch(type, req.user.campus, search)
						]
					},
					omit: { ownerID: true },
					include: { _count: { select: { members: true } } },
					take: page.LIMIT,
					skip: page.skiprecord,
					orderBy: { createdAt: sort === 'oldest' ? 'asc' : 'desc' }
				})
			const paginationInfo = buildPaginationObj(page, groups.length)
			return res.status(200).json({"data": groups, "pagination": paginationInfo})
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