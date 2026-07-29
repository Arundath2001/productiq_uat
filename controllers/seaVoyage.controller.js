import mongoose from "mongoose";
import SeaBatch from "../models/seaBatch.model.js";
import SeaBatchAssign from "../models/seaBatchAssign.model.js";
import SeaContainer from "../models/seaContainer.model.js";
import SeaVoyage from "../models/seaVoyage.model.js";
import User from "../models/user.model.js";
import { storeNotificationsForUsers } from "../lib/notificationService.js";
import { logUserActivity } from "../utils/activityLogger.js";

export const createSeaVoyage = async (req, res) => {
    try {
        const { seaVoyageName, seaVoyageNumber, branchId, year, lineId } = req.body;

        if (!seaVoyageName || seaVoyageName.trim() === "") {
            return res.status(404).json({
                success: false,
                message: "Sea voyage name is required"
            });
        }

        if (!seaVoyageNumber || seaVoyageNumber.trim() === "") {
            return res.status(404).json({
                success: false,
                message: "Sea voyage number is required"
            });
        }

        if (!branchId) {
            return res.status(404).json({
                success: false,
                message: "Branch Id is missing"
            });
        }

        const existingSeaVoyage = await SeaVoyage.findOne({ seaVoyageNumber }).lean();

        if (existingSeaVoyage) {
            return res.status(400).json({
                success: false,
                message: `Sea voyage ${seaVoyageNumber} already exist!`
            });
        }

        const newSeaVoyage = new SeaVoyage({
            seaVoyageName,
            seaVoyageNumber,
            branchId,
            lineId,
            year,
            createdBy: req.user.id,
        });

        await newSeaVoyage.save();

        await logUserActivity({
            req,
            action: "create",
            module: "sea_voyage",
            entityType: "SeaVoyage",
            entityId: newSeaVoyage._id,
            voyageId: newSeaVoyage._id,
            voyageNumber: newSeaVoyage.seaVoyageNumber,
            branchId: newSeaVoyage.branchId,
            description: `Created sea voyage ${newSeaVoyage.seaVoyageNumber}`,
            metadata: { seaVoyageName, year, lineId }
        });

        res.status(201).json({
            success: true,
            data: newSeaVoyage,
            message: "Sea voyage created successfully"
        });

    } catch (error) {
        console.log("Error in create sea voyage controller", error.message);
        res.status(500).json({ message: "Inernal server error" });
    }
}

export const getSeaVoyagesByBranchId = async (req, res) => {
    try {
        const branchId = req.user.branchId._id;
        const status = req.query.status;

        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;
        const searchQuery = req.query.search || "";

        if (!branchId) {
            return res.status(404).json({
                success: false,
                message: "Branch ID is required"
            });
        }

        const filter = { branchId };

        if (status) {
            filter.status = status;
        }

        if (searchQuery) {
            filter.$or = [
                { seaVoyageNumber: { $regex: searchQuery, $options: 'i' } },
                { seaVoyageName: { $regex: searchQuery, $options: "i" } }
            ];
        }

        const totalSeaVoyages = await SeaVoyage.countDocuments(filter);
        const totalPages = Math.ceil(totalSeaVoyages / limit);

        const seaVoyages = await SeaVoyage.aggregate([
            { $match: filter },
            {
                $sort: { createdAt: -1 }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {
                $lookup: {
                    from: "branches",
                    localField: "branchId",
                    foreignField: "_id",
                    as: "branchId"
                }
            },
            {
                $lookup: {
                    from: "lines",
                    localField: "lineId",
                    foreignField: "_id",
                    as: "lineId"
                }
            },
            {
                $lookup: {
                    from: "seabatchassigns",
                    localField: "_id",
                    foreignField: "seaVoyageId",
                    as: "batchAssignments"
                }
            },
            {
                $addFields: {
                    totalQuantityLoaded: {
                        $sum: "$batchAssignments.quantityLoaded"
                    },
                    totalCBM: {
                        $sum: "$batchAssignments.totalCBM"
                    },
                    batchCount: {
                        $size: "$batchAssignments"
                    },
                    branchId: {
                        $cond: {
                            if: { $gt: [{ $size: "$branchId" }, 0] },
                            then: {
                                _id: { $arrayElemAt: ["$branchId._id", 0] },
                                branchName: { $arrayElemAt: ["$branchId.branchName", 0] }
                            },
                            else: null
                        }
                    },
                    lineId: {
                        $cond: {
                            if: { $gt: [{ $size: "$lineId" }, 0] },
                            then: {
                                _id: { $arrayElemAt: ["$lineId._id", 0] },
                                lineName: { $arrayElemAt: ["$lineId.lineName", 0] }
                            },
                            else: null
                        }
                    }
                }
            },
            {
                $project: {
                    batchAssignments: 0,
                }
            }
        ]);


        res.status(200).json({
            success: true,
            message: "Sea voyages fetched successfully",
            seaVoyages,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalSeaVoyages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.log("Error in getSeaVoyagesByBranchId controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getPendingSeaVoyageOptions = async (req, res) => {
    try {
        const branchId = req.user.branchId?._id || req.user.branchId;

        if (!branchId) {
            return res.status(400).json({
                success: false,
                message: "Branch ID is required"
            });
        }

        const seaVoyages = await SeaVoyage.find({
            branchId,
            status: "pending"
        })
            .select("seaVoyageName seaVoyageNumber lineId")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            seaVoyages
        });
    } catch (error) {
        console.log("Error in getPendingSeaVoyageOptions controller", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const deleteSeaVoyage = async (req, res) => {
    try {
        const { seaVoyageId } = req.params;

        if (!seaVoyageId) {
            return res.status(400).json({
                success: false,
                message: "Failed to delete missing Sea voyage ID!"
            });
        }

        const seaVoyage = await SeaVoyage.findById(seaVoyageId).lean();

        if (!seaVoyage) {
            return res.status(404).json({
                success: false,
                message: "Sea voyage not found"
            });
        }

        await SeaVoyage.findByIdAndDelete(seaVoyageId);

        await logUserActivity({
            req,
            action: "delete",
            module: "sea_voyage",
            entityType: "SeaVoyage",
            entityId: seaVoyage._id,
            voyageId: seaVoyage._id,
            voyageNumber: seaVoyage.seaVoyageNumber,
            branchId: seaVoyage.branchId,
            description: `Deleted sea voyage ${seaVoyage.seaVoyageNumber}`
        });


        res.status(200).json({
            success: true,
            message: "Sea voyage deleted successfully"
        });


    } catch (error) {
        console.log("Error in deleteSeaVoyage controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const closeSeaVoyage = async (req, res) => {
    try {
        const { seaVoyageId } = req.params;
        const { destinationDate } = req.body;

        console.log(seaVoyageId, destinationDate, "testtttttttttttt closeeeeeeeeee");


        const seaVoyage = await SeaVoyage.findById(seaVoyageId).lean();

        if (!seaVoyage) {
            return res.status(404).json({
                success: false,
                message: "Sea Voyage does not exist"
            });
        }

        if (seaVoyage.status === 'completed') {
            return res.status(404).json({
                success: false,
                message: "Sea Voyage already in completed state"
            });
        }

        const updateData = {
            status: 'completed',
            trackingStatus: 'dispatched',
            dispatchDate: new Date()
        }

        if (destinationDate) {
            updateData.expectedDate = new Date(destinationDate);
        }

        await SeaVoyage.findByIdAndUpdate(
            seaVoyageId,
            updateData,
            { new: true }
        );

        const batchAssigns = await SeaBatchAssign.find({
            seaVoyageId: seaVoyageId
        }).select('seaBatchId').lean();

        const uniqueBatchIds = [...new Set(batchAssigns.map(assign => assign.seaBatchId.toString()))];

        await SeaBatchAssign.updateMany(
            { seaVoyageId: seaVoyageId },
            {
                trackingStatus: 'dispatched',
                status: 'completed'
            }
        );

        await SeaContainer.updateMany(
            {
                seaVoyageId: seaVoyageId
            },
            {
                status: 'completed'
            }
        );

        if (uniqueBatchIds.length > 0) {
            await SeaBatch.updateMany(
                { _id: { $in: uniqueBatchIds } },
                {
                    status: 'completed'
                }
            );
        }

        const companyCodes = [...new Set(
            await SeaBatchAssign.distinct("companyCode", { seaVoyageId })
        )];
        const clients = await User.find({ role: "client", companyCode: { $in: companyCodes } });
        const populatedVoyage = await SeaVoyage.findById(seaVoyageId).populate("branchId", "branchName");
        const branchName = populatedVoyage?.branchId?.branchName || "Unknown Branch";
        let notificationMessage = `Your sea cargo from Voyage ${seaVoyage.seaVoyageNumber} (${branchName}) has been dispatched to Libya and is now on its way.`;

        if (destinationDate) {
            notificationMessage += ` Expected delivery: ${new Date(destinationDate).toLocaleDateString()}`;
        }

        await storeNotificationsForUsers({
            users: clients,
            message: notificationMessage,
            category: "alert",
            type: "dispatch",
            cargoType: "sea",
            branchId: populatedVoyage?.branchId?._id || seaVoyage.branchId,
            entityType: "SeaVoyage",
            entityId: seaVoyageId,
            sentBy: req.user._id,
            metadata: {
                seaVoyageNumber: seaVoyage.seaVoyageNumber,
                expectedDate: destinationDate ? new Date(destinationDate) : null,
                companyCodes,
            },
        });

        await logUserActivity({
            req,
            action: "close",
            module: "sea_voyage",
            entityType: "SeaVoyage",
            entityId: seaVoyage._id,
            voyageId: seaVoyage._id,
            voyageNumber: seaVoyage.seaVoyageNumber,
            branchId: seaVoyage.branchId,
            description: `Closed and dispatched sea voyage ${seaVoyage.seaVoyageNumber}`,
            metadata: { destinationDate: destinationDate || null }
        });

        return res.status(200).json({
            success: true,
            message: `Sea Voyage ${seaVoyage.seaVoyageNumber} closed and dispatched successfully`
        });

    } catch (error) {
        console.log('Error in closeSeaVoyage controller', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getSeaVoyageByCompanyAndBranchId = async (req, res) => {
    try {
        const { branchId } = req.params;

        const companyCode = req.user.companyCode;

        const status = req.query.status || 'pending';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;


        const searchQuery = req.query.search || "";

        if (!branchId) {
            return res.status(400).json({
                success: false,
                message: "Branch ID does not exist"
            });
        }

        if (!companyCode) {
            return res.status(400).json({
                success: false,
                message: "Company Code does not exist on this user"
            });
        }

        const filter = {
            branchId: new mongoose.Types.ObjectId(branchId),
            companyCode: companyCode
        };

        const pipeline = [
            { $match: filter },
            {
                $group: {
                    _id: "$seaVoyageId",
                    totalQuantityLoaded: { $sum: "$quantityLoaded" },
                    totalCBM: { $sum: "$totalCBM" },
                    containerCount: { $addToSet: "$seaContainerId" },
                    batchCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "seavoyages",
                    let: { voyageId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$voyageId"] }, status } },
                        ...(searchQuery ? [{ $match: { seaVoyageNumber: { $regex: searchQuery, $options: 'i' } } }] : []),
                        {
                            $lookup: {
                                from: "branches",
                                localField: "branchId",
                                foreignField: "_id",
                                as: "branchId",
                                pipeline: [{ $project: { branchName: 1 } }]
                            }
                        },
                        { $unwind: { path: "$branchId", preserveNullAndEmptyArrays: true } }
                    ],
                    as: "voyage"
                }
            },
            { $unwind: "$voyage" },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [
                            "$voyage",
                            {
                                totalQuantityLoaded: "$totalQuantityLoaded",
                                totalCBM: "$totalCBM",
                                containerCount: { $size: "$containerCount" },
                                batchCount: "$batchCount"
                            }
                        ]
                    }
                }
            },
            { $sort: { createdAt: -1 } }
        ];

        const [countResult, seaVoyages] = await Promise.all([
            SeaBatchAssign.aggregate([
                ...pipeline.slice(0, 4),
                { $count: "total" }
            ]),
            SeaBatchAssign.aggregate([
                ...pipeline,
                { $skip: skip },
                { $limit: limit }
            ])
        ]);

        const totalCount = countResult[0]?.total || 0;
        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            success: true,
            message: `Sea Voyages for company ${companyCode} fetched successfully`,
            seaVoyages,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalCount,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        })

    } catch (error) {
        console.log('Error in getSeaVoyageByCompanyAndBranchId controller', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const updateCompletedVoyageStatus = async (req, res) => {
    try {
        const { updatedData } = req.body;
        const { voyageId } = req.params;

        console.log(updatedData, voyageId);


        if (!voyageId) {
            return res.status(400).json({ message: "Voyage ID is required!" });
        }

        if (!updatedData || Object.keys(updatedData).length === 0) {
            return res.status(400).json({
                message: "Updated data is required"
            });
        }

        const voyage = await SeaVoyage.findById(voyageId);
        if (!voyage) {
            return res.status(404).json({
                message: "Voyage not found"
            });
        }

        const allowedUpdates = {};

        if (updatedData.expectedDate) {
            allowedUpdates.expectedDate = new Date(updatedData.expectedDate);
        }

        if (updatedData.delayMessage !== undefined) {
            allowedUpdates.delayMessage = updatedData.delayMessage || null;
            allowedUpdates.trackingStatus = "delayed";
        }

        console.log("Allowed Updates:", allowedUpdates);

        if (Object.keys(allowedUpdates).length === 0) {
            return res.status(400).json({
                message: "No valid fields to update"
            });
        }

        const updatedVoyageStatus = await SeaVoyage.findByIdAndUpdate(voyageId, { $set: allowedUpdates },
            {
                new: true,
                runValidators: true
            },
        ).populate('branchId', 'branchName')
            .populate('createdBy', 'username');

        if (!updatedVoyageStatus) {
            return res.status(404).json({
                message: "Failed to update voyage"
            });
        }

        await logUserActivity({
            req,
            action: "update_status",
            module: "sea_voyage",
            entityType: "SeaVoyage",
            entityId: updatedVoyageStatus._id,
            voyageId: updatedVoyageStatus._id,
            voyageNumber: updatedVoyageStatus.seaVoyageNumber,
            branchId: updatedVoyageStatus.branchId,
            description: `Updated status details for sea voyage ${updatedVoyageStatus.seaVoyageNumber}`,
            metadata: allowedUpdates
        });

        if (updatedData.delayMessage !== undefined) {
            const companyCodes = [...new Set(
                await SeaBatchAssign.distinct("companyCode", { seaVoyageId: voyageId })
            )];
            const clients = await User.find({ role: "client", companyCode: { $in: companyCodes } });
            const branchName = updatedVoyageStatus.branchId?.branchName || "Unknown Branch";
            let notificationMessage = `Your sea cargo from Voyage ${updatedVoyageStatus.seaVoyageNumber} (${branchName}) is delayed.`;

            if (updatedData.delayMessage) {
                notificationMessage += ` ${updatedData.delayMessage}`;
            }

            if (updatedData.expectedDate) {
                notificationMessage += ` New expected delivery: ${new Date(updatedData.expectedDate).toLocaleDateString()}`;
            }

            await storeNotificationsForUsers({
                users: clients,
                message: notificationMessage,
                category: "alert",
                type: "delay",
                cargoType: "sea",
                branchId: updatedVoyageStatus.branchId?._id || updatedVoyageStatus.branchId,
                entityType: "SeaVoyage",
                entityId: updatedVoyageStatus._id,
                sentBy: req.user._id,
                metadata: {
                    seaVoyageNumber: updatedVoyageStatus.seaVoyageNumber,
                    expectedDate: updatedVoyageStatus.expectedDate,
                    delayMessage: updatedVoyageStatus.delayMessage,
                    companyCodes,
                },
            });
        }

        res.status(200).json({
            message: "Voyage updated successfully",
            voyage: updatedVoyageStatus
        });


    } catch (error) {
        console.error("Error in updateCompletedVoyageStatus controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}
