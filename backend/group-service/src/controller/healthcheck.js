import { db } from "../db.js";

export const healthcheck = async (req, res, next)=>{
    try {
        await db.group.count()
        next()
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: "error", database: "unreachable" })
    }
}