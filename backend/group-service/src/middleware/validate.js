export const validate = (schema) => {
	return function(req, res, next) 
	{
		const result = schema.safeParse(req.body)
		if (!result.success)
		{
			const issue = result.error.issues.map((issue) => ({
				error: issue.message,
				path: issue.path
			}));
			
			console.log(issue)
			return res.status(400).json(issue)
		}
		req.body = result.data;

		next();
	}
}