import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { success } from 'zod';

export const authUser = (req, res, next) => {
  const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith("Bearer "))
      return res.status(401).json({success: false, message: 'Unauthorized'})
    const token = authorization.split(" ")[1];
    if (!token)
      return res.status(401).json({ error: 'Access denied: No token provided' });
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      req.user.id = Number(req.user.id)
      next();
    }
    catch (err) {
      return res.status(401).json({error: 'Invalid or expired token'})
    }

}