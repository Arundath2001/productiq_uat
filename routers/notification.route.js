import express from "express";
import {
    getMyNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    notification
} from "../controllers/notification.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/sendNoti", protectRoute, notification);
router.get("/", protectRoute, getMyNotifications);
router.patch("/read-all", protectRoute, markAllNotificationsAsRead);
router.patch("/:notificationId/read", protectRoute, markNotificationAsRead);

export default router;
