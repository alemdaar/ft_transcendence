import { Router } from "express";
import { requireAuth } from "../middleware/require-auth";
import { batchUsers } from "../controllers/user-lookup.controller";

const usersRouter = Router();

usersRouter.post("/batch", requireAuth, batchUsers);

export default usersRouter;
