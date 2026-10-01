import { Router } from "express";
import { getUserById } from "../controllers/users.controller";

const router = Router();

router.get("/:id", getUserById);

export default router;