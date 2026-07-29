import Notification from "../models/notification.model.js";
import Company from "../models/company.model.js";
import User from "../models/user.model.js";
import { io } from "./socket.js";

const notificationValues = {
    category: {
        normal: 0,
        alert: 1,
    },
    type: {
        manual: 0,
        upload: 1,
        dispatch: 2,
        delay: 3,
        received: 4,
    },
    cargoType: {
        general: 0,
        air: 1,
        sea: 2,
    },
    entityType: {
        Manual: 0,
        Voyage: 1,
        SeaVoyage: 2,
        UploadedProduct: 3,
        SeaBatch: 4,
        SeaBatchAssign: 5,
    },
};

const storedNotificationTypes = [2, 3];

const toNotificationValue = (group, value) => {
    if (typeof value === "string") {
        return notificationValues[group][value];
    }

    return value;
};

export const getClientUsersByCompanyCodes = async (companyCodes) => {
    const codes = [...new Set((Array.isArray(companyCodes) ? companyCodes : [companyCodes]).filter(Boolean))];

    if (codes.length === 0) return [];

    return User.find({
        role: "client",
        companyCode: { $in: codes },
    });
};

export const getPushTokensFromUsers = (users) => {
    return users.flatMap((user) =>
        (user.expoPushTokens || [])
            .map((tokenObj) => tokenObj.token)
            .filter(Boolean)
    );
};

export const storeNotificationsForUsers = async ({
    users,
    title = "Aswaq Forwarder",
    message,
    category = "normal",
    type = "manual",
    cargoType = "general",
    branchId,
    entityType = "Manual",
    entityId,
    sentBy,
}) => {
    if (!message || !users?.length) return [];

    const notificationType = toNotificationValue("type", type);
    const companyCodes = [...new Set(users.map((user) => user.companyCode).filter(Boolean))];
    const companies = await Company.find({ companyCode: { $in: companyCodes } }).select("companyCode").lean();
    const companyIdByCode = new Map(companies.map((company) => [company.companyCode, company._id]));

    const notificationData = users.map((user) => ({
        recipient: user._id,
        title,
        message,
        category: toNotificationValue("category", category),
        type: notificationType,
        cargoType: toNotificationValue("cargoType", cargoType),
        branchId,
        entityType: toNotificationValue("entityType", entityType),
        entityId,
        sentBy,
        companyId: companyIdByCode.get(user.companyCode) || null,
        isRead: 0,
        readAt: null,
    }));

    if (!storedNotificationTypes.includes(notificationType)) {
        notificationData.forEach((notification) => {
            io.emit("notification-created", {
                notification,
                recipient: notification.recipient,
            });
        });

        return [];
    }

    const notifications = await Notification.insertMany(notificationData);

    notifications.forEach((notification) => {
        io.emit("notification-created", {
            notification,
            recipient: notification.recipient,
        });
    });

    return notifications;
};

export const storeCompanyNotifications = async ({
    companyCodes,
    ...notificationData
}) => {
    const users = await getClientUsersByCompanyCodes(companyCodes);
    const notifications = await storeNotificationsForUsers({
        users,
        ...notificationData,
    });

    return { users, notifications };
};
