import express from "express";
import { getUserActivities } from "../controllers/userActivity.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getUserActivities);

export default router;
