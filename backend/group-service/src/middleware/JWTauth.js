import jwt from 'jsonwebtoken'

export const authenticate = (req, res, next)=>{
	const {authorization: authHeader} = req.headers
	if (!authHeader)
		return res.status(401).json({error : 'Authorization header missing'});

	const match = authHeader.match(/^Bearer +(\S+)$/)
	if (!match)
		return res.status(401).json({error : 'Invalid Authorization header'});
	
	const token = match[1]
	const secret = process.env.JWT_SECRET
	try {
		req.user = jwt.verify(token, secret)
		next()
	} catch (error){
		console.log(`{error: {name: ${error.name}, message: ${error.message}}}`)
		return res.status(401).json({error: "Invalid or expired token"});
	}
}
