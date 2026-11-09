export const validate = (schema, source = 'body') => {
    return function(req, res, next) {

        const result = schema.safeParse(req[source]);
        
        if (!result.success) {
            if (source === 'params' || source === 'query') {
                return res.status(400).json({ 
                    error: result.error.issues[0].message 
                });
            }
            
            const fieldErrors = {}
            result.error.issues.forEach(issue => {
                const fieldName = issue.path[0] || 'error';
                // Only save the first error message per field
                if (!fieldErrors[fieldName]) {
                    fieldErrors[fieldName] = issue.message;
                }
            });
            
            return res.status(400).json({ 
                error: fieldErrors 
            });
        }
        
        if (source === 'body') {
            req.body = result.data;
        } else {
            req.validated = { ...(req.validated || {}), [source]: result.data };
        }

        next();
    }
}
