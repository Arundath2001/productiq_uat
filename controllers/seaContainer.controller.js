import SeaContainer from "../models/seaContainer.model.js";
import SeaBatchAssign from "../models/seaBatchAssign.model.js";
import SeaVoyage from "../models/seaVoyage.model.js";
import { logUserActivity } from "../utils/activityLogger.js";

export const createSeaContainer = async (req, res) => {
    try {
        const { containerNumber, seaVoyageId, branchId, containerCompanyId } = req.body;

        console.log(containerCompanyId);


        if (!containerNumber || containerNumber.trim() === '') {
            return res.status(404).json({
                success: false,
                message: "Container number is required"
            });
        }

        if (!seaVoyageId && !branchId) {
            return res.status(404).json({
                success: false,
                message: "Sea voyage ID and branch ID is required"
            });
        }

        const newSeaContainer = new SeaContainer({
            containerNumber,
            seaVoyageId,
            branchId,
            createdBy: req.user._id,
            containerCompanyId
        });

        await newSeaContainer.save();

        const voyage = await SeaVoyage.findById(seaVoyageId).select("seaVoyageNumber").lean();
        await logUserActivity({
            req,
            action: "create_container",
            module: "sea_container",
            entityType: "SeaContainer",
            entityId: newSeaContainer._id,
            voyageId: seaVoyageId,
            voyageNumber: voyage?.seaVoyageNumber,
            branchId,
            description: `Created container ${containerNumber} for sea voyage ${voyage?.seaVoyageNumber || seaVoyageId}`,
            metadata: { containerCompanyId }
        });

        res.status(201).json({
            success: true,
            message: "Sea container created successfully",
            data: newSeaContainer
        });

    } catch (error) {
        console.log("Error in createSeaContainer controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getSeaContainerByBranchAndVoyage = async (req, res) => {
    try {
        const { seaVoyageId } = req.params;
        const branchId = req.user.branchId;
        const { status } = req.query;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const searchQuery = req.query.search || "";

        if (!branchId && !seaVoyageId) {
            return res.status(404).json({
                success: false,
                message: "Sea and voyage ID are required"
            });
        }

        const seaVoyage = await SeaVoyage.findById(seaVoyageId).select('seaVoyageNumber seaVoyageName status').lean();

        if (!seaVoyage) {
            return res.status(404).json({
                success: false,
                message: 'Sea voyage does not exist'
            })
        }

        const filter = { branchId, seaVoyageId };

        if (status) {
            filter.status = status;
        }

        if (searchQuery) {
            filter.containerNumber = { $regex: searchQuery, $options: 'i' }
        }

        const totalSeaContainers = await SeaContainer.countDocuments(filter);
        const totalPages = Math.ceil(totalSeaContainers / limit);

        const seaContainers = await SeaContainer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('containerCompanyId', 'containerCompanyName').populate('seaVoyageId', 'seaVoyageNumber').lean();

        res.status(200).json({
            success: true,
            message: "Sea containers fetched successfully",
            seaContainers,
            seaVoyage,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalSeaContainers,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.log("Error in createSeaContainer controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getSeaContainerByBranch = async (req, res) => {
    try {
        const branchId = req.user.branchId;
        const { status } = req.query;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const searchQuery = req.query.search || "";

        if (!branchId) {
            return res.status(404).json({
                success: false,
                message: "branch ID is required"
            });
        }

        const filter = { branchId };
        console.log(status);


        if (status) {
            filter.status = status;
        }

        if (searchQuery) {
            filter.containerNumber = { $regex: searchQuery, $options: 'i' }
        }

        const totalSeaContainers = await SeaContainer.countDocuments(filter);
        const totalPages = Math.ceil(totalSeaContainers / limit);

        const seaContainers = await SeaContainer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('containerCompanyId', 'containerCompanyName').populate('seaVoyageId', 'seaVoyageNumber').lean();

        res.status(200).json({
            success: true,
            message: "Sea containers fetched successfully",
            seaContainers,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalSeaContainers,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.log("Error in createSeaContainer controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const deleteSeaContainer = async (req, res) => {
    try {
        const { containerId } = req.params;

        if (!containerId) {
            return res.status(400).json({
                success: false,
                message: "Container ID is required"
            });
        }

        const seaContainer = await SeaContainer.findById(containerId).lean();

        if (!seaContainer) {
            return res.status(400).json({
                success: false,
                message: "Container does not exisit"
            });
        }

        await SeaContainer.findByIdAndDelete(containerId);

        const voyage = await SeaVoyage.findById(seaContainer.seaVoyageId).select("seaVoyageNumber").lean();
        await logUserActivity({
            req,
            action: "delete_container",
            module: "sea_container",
            entityType: "SeaContainer",
            entityId: seaContainer._id,
            voyageId: seaContainer.seaVoyageId,
            voyageNumber: voyage?.seaVoyageNumber,
            branchId: seaContainer.branchId,
            description: `Deleted container ${seaContainer.containerNumber} from sea voyage ${voyage?.seaVoyageNumber || seaContainer.seaVoyageId}`
        });

        res.status(200).json({
            success: true,
            message: "Container deleted successfully"
        })

    } catch (error) {
        console.log("Error in deleteSeaContainer controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const changeSeaContainerVoyage = async (req, res) => {
    try {
        const { containerId } = req.params;
        const { seaVoyageId } = req.body;
        const branchId = req.user.branchId?._id || req.user.branchId;

        if (!containerId || !seaVoyageId) {
            return res.status(400).json({
                success: false,
                message: "Container ID and sea voyage ID are required"
            });
        }

        const [seaContainer, targetVoyage] = await Promise.all([
            SeaContainer.findOne({ _id: containerId, branchId }),
            SeaVoyage.findOne({ _id: seaVoyageId, branchId, status: "pending" }).lean()
        ]);

        if (!seaContainer) {
            return res.status(404).json({
                success: false,
                message: "Sea container does not exist"
            });
        }

        if (!targetVoyage) {
            return res.status(404).json({
                success: false,
                message: "The selected pending sea voyage does not exist"
            });
        }

        if (seaContainer.seaVoyageId.toString() === seaVoyageId) {
            return res.status(400).json({
                success: false,
                message: "The container is already assigned to this voyage"
            });
        }

        await SeaBatchAssign.updateMany(
            { seaContainerId: seaContainer._id },
            { $set: { seaVoyageId: targetVoyage._id } }
        );

        const previousVoyageId = seaContainer.seaVoyageId;
        seaContainer.seaVoyageId = targetVoyage._id;
        await seaContainer.save();

        const previousVoyage = await SeaVoyage.findById(previousVoyageId).select("seaVoyageNumber").lean();
        await logUserActivity({
            req,
            action: "move_container",
            module: "sea_container",
            entityType: "SeaContainer",
            entityId: seaContainer._id,
            voyageId: targetVoyage._id,
            voyageNumber: targetVoyage.seaVoyageNumber,
            branchId,
            description: `Moved container ${seaContainer.containerNumber} from sea voyage ${previousVoyage?.seaVoyageNumber || previousVoyageId} to ${targetVoyage.seaVoyageNumber}`,
            metadata: {
                previousVoyageId,
                previousVoyageNumber: previousVoyage?.seaVoyageNumber
            }
        });

        return res.status(200).json({
            success: true,
            message: `Container ${seaContainer.containerNumber} moved to voyage ${targetVoyage.seaVoyageNumber}`,
            seaContainer
        });
    } catch (error) {
        console.log("Error in changeSeaContainerVoyage controller", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getTotalSeaContainerByBranch = async (req, res) => {
    try {
        const branchId = req.user.branchId;
        const { status, seaVoyageId } = req.query;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const searchQuery = req.query.search || "";

        if (!branchId) {
            return res.status(404).json({
                success: false,
                message: "branch ID is required"
            });
        }

        const filter = { branchId };
        console.log(status);

        if (seaVoyageId) {
            filter.seaVoyageId = seaVoyageId;
        }


        if (status) {
            filter.status = status;
        }

        if (searchQuery) {
            filter.containerNumber = { $regex: searchQuery, $options: 'i' }
        }

        const totalSeaContainers = await SeaContainer.countDocuments(filter);
        const totalPages = Math.ceil(totalSeaContainers / limit);

        const seaContainers = await SeaContainer.find(filter).sort({ createdAt: -1 }).populate('containerCompanyId', 'containerCompanyName').populate('seaVoyageId', 'seaVoyageNumber').lean();

        res.status(200).json({
            success: true,
            message: "Sea containers fetched successfully",
            seaContainers,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalSeaContainers,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.log("Error in createSeaContainer controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}
