import { io } from "../lib/socket.js";
import User from "../models/user.model.js";
import { Expo } from 'expo-server-sdk';
import Notification from "../models/notification.model.js";
import { getPushTokensFromUsers, storeNotificationsForUsers } from "../lib/notificationService.js";

const getNotificationValue = (value) => {
    if (value === undefined || value === null || value === "") return undefined;
    const notificationValue = Number(value);
    return Number.isNaN(notificationValue) ? undefined : notificationValue;
};

const getDateRange = (date) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

    const startDate = new Date(`${date}T00:00:00`);
    const endDate = new Date(`${date}T23:59:59.999`);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return null;
    }

    return { startDate, endDate };
};

export const notification = async (req, res) => {
    try {
        const {
            message,
            title = (process.env.APP_NAME || "Aswaq Forwarder"),
            sendPushNotification = true,
            category = "normal",
            type = "manual",
        } = req.body;

        if (!message) {
            return res.status(400).json({ message: "Message content is required" });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Only admin can broadcast messages" });
        }

        const clientUsers = await User.find({ role: "client" });

        await storeNotificationsForUsers({
            users: clientUsers,
            title,
            message,
            category,
            type,
            cargoType: "general",
            sentBy: req.user._id,
        });

        io.emit("broadcast-message", {
            title,
            message,
            category,
            type,
            timestamp: new Date(),
            sender: req.user.username || "Admin"
        });

        if (sendPushNotification) {
            const tokens = getPushTokensFromUsers(clientUsers);
            
            if (tokens.length > 0) {
                await sendPushNotifications(tokens, message, title);
            }
        }

        res.status(200).json({ 
            success: true, 
            message: "Broadcast sent successfully",
            recipientCount: clientUsers.length
        });

    } catch (error) {
        console.error("Error in broadcast message controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};


const sendPushNotifications = async (tokens, message, title) => {
    let expo = new Expo();
    
    const messages = tokens.map(token => ({
        to: token,
        sound: 'default',
        title: title,
        body: message,
        data: { type: 'broadcast' },
    }));

    try {
        let chunks = expo.chunkPushNotifications(messages);
        let tickets = [];

        for (let chunk of chunks) {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
        }

        console.log(`Push notifications sent to ${tokens.length} devices`);
        return tickets;
    } catch (error) {
        console.error('Error sending push notifications:', error);
        throw error;
    }
};

export const getMyNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const category = req.query.category;
        const type = req.query.type;
        const cargoType = req.query.cargoType;
        const date = req.query.date;

        const filter = {
            recipient: req.user._id,
            type: { $in: [2, 3] },
        };

        if (category !== undefined) {
            const categoryValue = getNotificationValue(category);
            if (categoryValue === undefined) {
                return res.status(400).json({ message: "Invalid notification category" });
            }
            filter.category = categoryValue;
        }

        if (type !== undefined) {
            const typeValue = getNotificationValue(type);
            if (typeValue === undefined) {
                return res.status(400).json({ message: "Invalid notification type" });
            }
            filter.type = typeValue;
        }

        if (cargoType !== undefined) {
            const cargoTypeValue = getNotificationValue(cargoType);
            if (cargoTypeValue === undefined) {
                return res.status(400).json({ message: "Invalid notification cargo type" });
            }
            filter.cargoType = cargoTypeValue;
        }

        if (date !== undefined) {
            const dateRange = getDateRange(date);
            if (!dateRange) {
                return res.status(400).json({ message: "Invalid notification date" });
            }

            filter.createdAt = {
                $gte: dateRange.startDate,
                $lte: dateRange.endDate,
            };
        }

        const [notifications, totalItems, unreadCount] = await Promise.all([
            Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Notification.countDocuments(filter),
            Notification.countDocuments({ recipient: req.user._id, type: { $in: [2, 3] }, isRead: { $ne: 1 } }),
        ]);

        res.status(200).json({
            notifications,
            unreadCount,
            pagination: {
                currentPage: page,
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                itemsPerPage: limit,
                hasNextPage: page < Math.ceil(totalItems / limit),
                hasPrevPage: page > 1,
            },
        });
    } catch (error) {
        console.error("Error in getMyNotifications controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const markNotificationAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.notificationId, recipient: req.user._id, type: { $in: [2, 3] } },
            { $set: { isRead: 1, readAt: new Date() } },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({ message: "Notification marked as read", notification });
    } catch (error) {
        console.error("Error in markNotificationAsRead controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const markAllNotificationsAsRead = async (req, res) => {
    try {
        const result = await Notification.updateMany(
            { recipient: req.user._id, type: { $in: [2, 3] }, isRead: { $ne: 1 } },
            { $set: { isRead: 1, readAt: new Date() } }
        );

        res.status(200).json({
            message: "Notifications marked as read",
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        console.error("Error in markAllNotificationsAsRead controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
