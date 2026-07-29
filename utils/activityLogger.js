import UserActivity from "../models/userActivity.model.js";

const getId = (value) => value?._id || value || null;

export const logUserActivity = async ({
    req,
    actor = null,
    action,
    module,
    entityType,
    entityId = null,
    voyageId = null,
    voyageNumber = null,
    branchId = null,
    description,
    metadata = {}
}) => {
    try {
        const user = actor || req?.user;

        const activity = await UserActivity.create({
            actor: getId(user),
            actorSnapshot: {
                username: user?.username || "System",
                role: user?.role || "system",
                adminRoles: user?.adminRoles || []
            },
            action,
            module,
            entityType,
            entityId: getId(entityId),
            voyageId: getId(voyageId),
            voyageNumber: voyageNumber ? String(voyageNumber) : null,
            branchId: getId(branchId),
            description,
            metadata,
            ipAddress: req?.ip || req?.socket?.remoteAddress || null,
            userAgent: req?.get?.("user-agent") || null
        });

        if (req) req.activityLogged = true;

        return activity;
    } catch (error) {
        console.error("Failed to record user activity:", error.message);
        return null;
    }
};
