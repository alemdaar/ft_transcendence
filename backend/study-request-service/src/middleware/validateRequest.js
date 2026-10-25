export const validate = (schemaObj) => {
    
    return function(req, res, next)
    {
        const result = schemaObj.safeParse(req.body);
        if (!result.success)
        {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message
            }))
            console.log({errors})
            return res.status(400).json({errors});
        }
        req.body = result.data;
        // console.log(result.data)
        next();
    }
    
}

export const validateParamId = (schemaObj) => {
    
    return function(req, res, next)
    {
        const result = schemaObj.safeParse(req.params);
        if (!result.success)
            return res.status(400).json({ error: 'invalid id' });
        console.log('succes')
        req.params = result.data;
        next();
    }
    
}