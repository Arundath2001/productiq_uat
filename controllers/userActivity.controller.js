import UserActivity from "../models/userActivity.model.js";

const isSuperAdmin = (user) =>
    Array.isArray(user?.adminRoles) &&
    user.adminRoles.some(role => role?.trim().toLowerCase() === "superadmin");

export const getUserActivities = async (req, res) => {
    try {
        if (!isSuperAdmin(req.user)) {
            return res.status(403).json({ message: "Superadmin access required" });
        }

        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
        const skip = (page - 1) * limit;
        const search = req.query.search?.trim();
        const moduleName = req.query.module?.trim();
        const action = req.query.action?.trim();
        const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

        const visibleActivityFilter = {
            "metadata.path": {
                $nin: [
                    "/api/auth/update-expo-token",
                    "/api/auth/remove-expo-token"
                ]
            }
        };
        const filter = { ...visibleActivityFilter };

        if (moduleName) filter.module = moduleName;
        if (action) filter.action = action;
        if (startDate && !Number.isNaN(startDate.getTime())) {
            filter.createdAt = { ...filter.createdAt, $gte: startDate };
        }
        if (endDate && !Number.isNaN(endDate.getTime())) {
            endDate.setHours(23, 59, 59, 999);
            filter.createdAt = { ...filter.createdAt, $lte: endDate };
        }
        if (search) {
            const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const searchRegex = new RegExp(escapedSearch, "i");
            filter.$or = [
                { description: searchRegex },
                { voyageNumber: searchRegex },
                { "actorSnapshot.username": searchRegex },
                { action: searchRegex },
                { module: searchRegex }
            ];
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const last24Hours = new Date(Date.now() - (24 * 60 * 60 * 1000));

        const [activities, totalItems, summaryResult, modules, actions] = await Promise.all([
            UserActivity.find(filter)
                .populate("actor", "username role adminRoles")
                .populate("branchId", "branchName")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            UserActivity.countDocuments(filter),
            UserActivity.aggregate([
                { $match: visibleActivityFilter },
                {
                    $group: {
                        _id: null,
                        loginsLast24Hours: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $eq: ["$action", "login"] },
                                            { $gte: ["$createdAt", last24Hours] }
                                        ]
                                    },
                                    1,
                                    0
                                ]
                            }
                        },
                        uploadsToday: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $eq: ["$action", "upload"] },
                                            { $gte: ["$createdAt", today] }
                                        ]
                                    },
                                    1,
                                    0
                                ]
                            }
                        },
                        voyageChangesToday: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $gte: ["$createdAt", today] },
                                            { $in: ["$module", ["air_voyage", "sea_voyage", "sea_container", "sea_assignment"]] }
                                        ]
                                    },
                                    1,
                                    0
                                ]
                            }
                        },
                        destructiveActionsToday: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $gte: ["$createdAt", today] },
                                            {
                                                $in: [
                                                    "$action",
                                                    ["delete", "delete_product", "delete_container"]
                                                ]
                                            }
                                        ]
                                    },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        loginsLast24Hours: 1,
                        uploadsToday: 1,
                        voyageChangesToday: 1,
                        destructiveActionsToday: 1
                    }
                }
            ]),
            UserActivity.distinct("module", visibleActivityFilter),
            UserActivity.distinct("action", visibleActivityFilter)
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        return res.status(200).json({
            activities,
            summary: summaryResult[0] || {
                loginsLast24Hours: 0,
                uploadsToday: 0,
                voyageChangesToday: 0,
                destructiveActionsToday: 0
            },
            filters: {
                modules: modules.sort(),
                actions: actions.sort()
            },
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error("Error fetching user activities:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
