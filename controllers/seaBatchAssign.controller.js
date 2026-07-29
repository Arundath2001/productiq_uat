import mongoose from "mongoose";
import SeaBatch from "../models/seaBatch.model.js";
import SeaBatchAssign from "../models/seaBatchAssign.model.js";
import SeaContainer from "../models/seaContainer.model.js";
import Company from "../models/company.model.js";
import SeaVoyage from "../models/seaVoyage.model.js";
import { logUserActivity } from "../utils/activityLogger.js";

export const assignVoyageAndContainer = async (req, res) => {
    try {
        const {
            seaBatchNumber,
            seaVoyageId,
            seaContainerId,
            quantityLoaded,
            cbmCaluculationType,
            length,
            width,
            height,
            totalCBM,
            weight
        } = req.body;

        const seaBatch = await SeaBatch.findOne({ seaBatchNumber }).populate('productId', 'companyCode productCode');

        if (!seaBatch) {
            return res.status(404).json({
                success: false,
                message: `Batch ${seaBatchNumber} does not exist`
            });
        }

        if (!seaBatch.canLoad(quantityLoaded)) {
            return res.status(404).json({
                success: false,
                message: `Insufficient quantity. Available: ${seaBatch.availableQuantity}, Requested: ${quantityLoaded}`
            });
        }

        let calculatedCBM;

        if (cbmCaluculationType === 'manual') {

            if (totalCBM == null || totalCBM < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Valid total CBM is required for manual entry"
                });
            }

            calculatedCBM = totalCBM;

        } else {
            if (!length || !width || !height) {
                return res.status(400).json({
                    success: false,
                    message: "Length, width, and height are required for calculate CBM"
                });
            }
            calculatedCBM = SeaBatchAssign.calculateCBM(length, width, height, quantityLoaded, cbmCaluculationType);
        }


        const newSeaBatchAssign = new SeaBatchAssign({
            seaBatchId: seaBatch._id,
            seaBatchNumber,
            seaVoyageId,
            seaContainerId,
            quantityLoaded,
            cbmCaluculationType,
            length: length || null,
            width: width || null,
            height: height || null,
            totalCBM: calculatedCBM,
            createdBy: req.user._id,
            branchId: req.user.branchId,
            productId: seaBatch.productId,
            companyCode: seaBatch.productId.companyCode,
            productCode: seaBatch.productId.productCode,
            weight
        });

        await newSeaBatchAssign.save();

        await seaBatch.updateQuantityAfterLoad(quantityLoaded);

        const [voyage, container] = await Promise.all([
            SeaVoyage.findById(seaVoyageId).select("seaVoyageNumber branchId").lean(),
            SeaContainer.findById(seaContainerId).select("containerNumber").lean()
        ]);
        await logUserActivity({
            req,
            action: "assign_batch",
            module: "sea_assignment",
            entityType: "SeaBatchAssign",
            entityId: newSeaBatchAssign._id,
            voyageId: seaVoyageId,
            voyageNumber: voyage?.seaVoyageNumber,
            branchId: voyage?.branchId || req.user.branchId,
            description: `Assigned batch ${seaBatchNumber} to container ${container?.containerNumber || seaContainerId} in sea voyage ${voyage?.seaVoyageNumber || seaVoyageId}`,
            metadata: { seaContainerId, quantityLoaded, totalCBM: calculatedCBM, weight }
        });

        res.status(201).json({
            success: true,
            message: "Container and voyage assign successfully"
        })

    } catch (error) {
        console.log("Error in assignVoyageAndContainer controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const getBatchAssignCompany = async (req, res) => {
    try {
        const { seaContainerId } = req.params;

        const branchId = req.user.branchId;

        const status = req.query.status || "active";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const searchQuery = req.query.search || "";

        if (!branchId || !seaContainerId) {
            return res.status(404).json({
                success: false,
                message: "Missing required parameters branch ID and sea-container ID"
            });
        }

        const filter = { branchId: new mongoose.Types.ObjectId(branchId), seaContainerId: new mongoose.Types.ObjectId(seaContainerId), status };

        if (searchQuery) {
            filter.$or = [
                { seaBatchNumber: { $regex: searchQuery, $options: "i" } },
                { companyCode: { $regex: searchQuery, $options: "i" } },
                { productCode: { $regex: searchQuery, $options: "i" } }
            ]
        }

        const result = await SeaBatchAssign.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: "$companyCode",
                    companyCode: { $first: "$companyCode" },
                    totalQuantity: { $sum: "$quantityLoaded" },
                    totalCBM: { $sum: "$totalCBM" },
                    batchCount: { $sum: 1 }
                }
            },
            { $sort: { companyCode: 1 } },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $skip: skip },
                        { $limit: limit }
                    ]
                }
            }
        ]);

        const totalCount = result[0].metadata[0]?.total || 0;
        const seaCompanies = result[0].data;
        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            success: true,
            message: "Batch details company wise fetched successfully",
            seaCompanies,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalCount,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        })


    } catch (error) {
        console.log("Error in getBatchAssignCompany controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getSeaBatchDetailsByCompany = async (req, res) => {
    try {

        const { branchId, seaContainerId, companyCode } = req.params;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const searchQuery = req.query.search || "";

        if (!branchId || !seaContainerId || !companyCode) {
            return res.status(404).json({
                success: false,
                message: "Missing required parameters: branch ID, sea-container ID, and company code"
            });
        }

        const filter = {
            branchId: new mongoose.Types.ObjectId(branchId),
            seaContainerId: new mongoose.Types.ObjectId(seaContainerId),
            companyCode
        }

        if (searchQuery) {
            filter.$or = [
                { seaBatchNumber: { $regex: searchQuery, $options: 'i' } },
                { productCode: { $regex: searchQuery, $options: 'i' } }
            ];
        }

        const totalCount = await SeaBatchAssign.countDocuments(filter);

        const batches = await SeaBatchAssign.find(filter).sort({ seaBatchNumber: 1 }).skip(skip).limit(limit).lean();

        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            success: true,
            message: `Batch details for company ${companyCode} fetched successfully`,
            batches,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalCount,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        })

    } catch (error) {
        console.log("Error in getSeaBatchDetailsByCompany controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getSeaBatchAssignByCompany = async (req, res) => {
    try {
        const { seaBatchId, companyCode } = req.params;

        console.log(companyCode);

        if (!companyCode) {
            return res.status(404).json({
                success: false,
                message: "The user does not have company code"
            })
        }

        const seaBatchAssignments = await SeaBatchAssign.find({ seaBatchId, companyCode }).populate('branchId', 'branchName').populate('seaVoyageId', 'seaVoyageNumber status').populate('seaContainerId', 'containerNumber ').lean();

        res.status(200).json({
            success: true,
            message: `sea-assign data for company ${companyCode} fetched successfully`,
            seaBatchAssignments
        })

    } catch (error) {
        console.log("Error in getSeaBatchAssignByCompany controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getSeaBatchDetailsByCompanyWise = async (req, res) => {
    try {
        const { seaContainerId } = req.params;

        const { status } = req.query;
        console.log(req.query);

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const searchQuery = req.query.search || '';

        if (!seaContainerId) {
            return res.status(404).json({
                success: false,
                message: "Missing container ID"
            });
        }

        const seaContainerDetails = await SeaContainer.findById(seaContainerId).lean();

        if (!seaContainerDetails) {
            return res.status(404).json({
                success: false,
                message: "Sea-Container does not exist"
            });
        }

        const filter = { seaContainerId: new mongoose.Types.ObjectId(seaContainerId), status }

        if (searchQuery) {
            filter.companyCode = { $regex: searchQuery, $options: 'i' }
        }

        const result = await SeaBatchAssign.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$companyCode',
                    totalQuantity: { $sum: '$quantityLoaded' },
                    totalCBM: { $sum: '$totalCBM' },
                    createdAt: { $max: '$createdAt' }
                }
            },
            {
                $addFields: {
                    totalCBM: { $round: ['$totalCBM', 2] }
                }
            },
            {
                $project: {
                    _id: 1,
                    companyCode: '$_id',
                    totalQuantity: 1,
                    totalCBM: 1,
                    createdAt: 1
                }
            },
            { $sort: { companyCode: 1 } },
            {
                $facet: {
                    metaData: [
                        { $count: 'total' }
                    ],
                    data: [
                        { $skip: skip },
                        { $limit: limit }
                    ]
                }
            }
        ]);

        const seaCompanies = result[0].data;
        const totalCount = result[0].metaData.length > 0 ? result[0].metaData[0]?.total : 0;
        const totalPages = Math.ceil(totalCount / limit);

        res.status(201).json({
            success: true,
            seaCompanies,
            seaContainerDetails,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalCount,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        })

    } catch (error) {
        console.log("Error in getCompanyDetailsInBatch controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getSeaBatchAssignCompanyData = async (req, res) => {
    try {
        const { seaContainerId, companyCode } = req.params;

        const status = req.query.status || 'active';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const searchQuery = req.query.search || "";

        if (!seaContainerId) {
            return res.staus(404).json({
                success: false,
                message: "Container ID is missing"
            });
        }

        if (!companyCode) {
            return res.staus(404).json({
                success: false,
                message: "Company code is missing"
            });
        }

        const companyDetails = await Company.findOne({ companyCode }).lean();

        if (!companyDetails) {
            return res.status(404).json({
                success: false,
                message: `Company ${companyDetails.companyCode} does not exist`
            })
        }

        const filter = { seaContainerId: new mongoose.Types.ObjectId(seaContainerId), companyCode, status };

        if (searchQuery) {
            filter.productCode = { $regex: searchQuery, $options: 'i' }
        }

        const totalCount = await SeaBatchAssign.countDocuments(filter);

        const seaBatchAssignCompanyData = await SeaBatchAssign.find(filter).populate('seaBatchId', 'deliveryPaperNumber supplierName deliveryPaperImages productImages').populate('seaContainerId', 'containerNumber').populate('createdBy', 'username').limit(limit).skip(skip).lean();

        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            success: true,
            message: `${companyDetails.companyCode} batch details fetched successfully `,
            seaBatchAssignCompanyData,
            companyDetails,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalCount,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        })


    } catch (error) {
        console.log('Error in getSeaBatchAssignCompanyData controller', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getSeaBatchAssignBySeaVoyage = async (req, res) => {
    try {
        const { seaVoyageId, companyCode } = req.params;

        console.log(companyCode);

        const status = req.query.status || 'completed';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const searchQuery = req.query.search || "";

        const seaVoyage = await SeaVoyage.findById(seaVoyageId).lean();

        if (!seaVoyage) {
            return res.status(404).json({
                success: false,
                message: "Sea Voyage does not exist"
            });
        }

        const filter = { seaVoyageId: new mongoose.Types.ObjectId(seaVoyageId), status, companyCode };

        if (searchQuery) {
            filter.$or = [
                { seaBatchNumber: { $regex: searchQuery, $options: 'i' } },
                { productCode: { $regex: searchQuery, $options: 'i' } }
            ]
        }

        const result = await SeaBatchAssign.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: "$seaBatchId",
                    seaBatchNumber: { $first: "$seaBatchNumber" },
                    totalCBM: { $sum: "$totalCBM" },
                    containerCount: { $sum: 1 },
                    seaVoyageIds: { $addToSet: "$seaVoyageId" }
                }
            },
            {
                $facet: {
                    metadata: [{ $count: "totalCount" }],
                    data: [
                        {
                            $lookup: {
                                from: "seabatches",
                                localField: "_id",
                                foreignField: "_id",
                                as: "batchDetails"
                            }
                        },
                        {
                            $unwind: "$batchDetails"
                        },
                        {
                            $lookup: {
                                from: "seavoyages",
                                localField: "seaVoyageIds",
                                foreignField: "_id",
                                as: "voyages"
                            }
                        },
                        {
                            $project: {
                                _id: "$batchDetails._id",
                                seaBatchNumber: "$batchDetails.seaBatchNumber",
                                createdAt: "$batchDetails.createdAt",
                                deliveryPaperNumber: "$batchDetails.deliveryPaperNumber",
                                supplierName: "$batchDetails.supplierName",
                                totalQuantity: "$batchDetails.totalQuantity",
                                productCode: "$batchDetails.productCode",
                                status: "$batchDetails.status",
                                deliveryPaperImages: "$batchDetails.deliveryPaperImages",
                                productImages: "$batchDetails.productImages",
                                companyCode: "$batchDetails.companyCode",
                                loadedQuantity: "$batchDetails.loadedQuantity",
                                voyageNumbers: {
                                    $map: {
                                        input: "$voyages",
                                        as: "voyage",
                                        in: {
                                            _id: "$$voyage._id",
                                            seaVoyageNumber: "$$voyage.seaVoyageNumber"
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $sort: { createdAt: -1 }
                        },
                        {
                            $skip: skip
                        },
                        {
                            $limit: limit
                        }
                    ]
                }
            }
        ]);

        const totalCount = result[0]?.metadata[0]?.totalCount || 0;
        const seaBatchDetails = result[0]?.data || [];
        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            success: true,
            message: `Sea voyage ${seaVoyage.seaVoyageNumber} - batch data fetched successfully`,
            seaBatchDetails,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalCount,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        })

    } catch (error) {
        console.log('Error in getSeaBatchAssignBySeaVoyage controller', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getSeaVoyageDetailsByBatch = async (req, res) => {
    try {
        const { seaBatchId } = req.params;
        console.log(seaBatchId, "test");

        if (!seaBatchId) {
            return res.status(404).json({ success: false, message: "Missing sea batch ID" });
        }

        const seaVoyageInfo = await SeaBatchAssign.aggregate([
            {
                $match: { seaBatchId: new mongoose.Types.ObjectId(seaBatchId) }
            }, {
                $lookup: {
                    from: "seavoyages",
                    localField: "seaVoyageId",
                    foreignField: "_id",
                    as: "voyageDetails"
                }
            },
            {
                $unwind: {
                    path: "$voyageDetails",
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $project: {
                    _id: "$voyageDetails._id",
                    seaVoyageNumber: "$voyageDetails.seaVoyageNumber"
                }
            }
        ]);

        if (!seaVoyageInfo) {
            return res.status(404).json({
                success: false,
                message: "No voyage information found for this batch ID"
            });
        }

        res.status(200).json({
            success: true,
            seaVoyageInfo
        });


    } catch (error) {
        console.log('Error in getVoyageDetailsByBatch controller', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const exportContainerData = async (req, res) => {
    try {

        const { seaVoyageId, seaContainerId } = req.params;
        const { status } = req.query;

        const assignmentStatus = status === "completed"
            ? "completed"
            : status === "active" || status === "pending"
                ? "active"
                : null;

        const matchFilter = {
            seaVoyageId: new mongoose.Types.ObjectId(seaVoyageId),
            seaContainerId: new mongoose.Types.ObjectId(seaContainerId),
            status: assignmentStatus || { $in: ["active", "completed"] }
        };

        const containerData = await SeaBatchAssign.aggregate([
            {
                $match: matchFilter
            },
            {
                $lookup: {
                    from: "seavoyages",
                    localField: "seaVoyageId",
                    foreignField: "_id",
                    as: "seaVoyageInfo"
                }
            },
            {
                $lookup: {
                    from: "seacontainers",
                    localField: "seaContainerId",
                    foreignField: "_id",
                    as: "seaContainerInfo"
                }
            },
            {
                $lookup: {
                    from: "seabatches",
                    localField: "seaBatchId",
                    foreignField: "_id",
                    as: "seaBatchInfo"
                }
            },
            {
                $lookup: {
                    from: "lines",
                    localField: "seaVoyageInfo.lineId",
                    foreignField: "_id",
                    as: "lineInfo"
                }
            },
            {
                $lookup: {
                    from: "containercompanies",
                    localField: "seaContainerInfo.containerCompanyId",
                    foreignField: "_id",
                    as: "containerCompanyInfo"
                }
            },
            {
                $unwind: {
                    path: "$seaVoyageInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$seaContainerInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$seaBatchInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$lineInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$containerCompanyInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: null,
                    seaVoyageInfo: { $first: "$seaVoyageInfo" },
                    seaContainerInfo: { $first: "$seaContainerInfo" },
                    lineInfo: { $first: "$lineInfo" },
                    containerCompanyInfo: { $first: "$containerCompanyInfo" },
                    batchAssignments: {
                        $push: {
                            seaBatchNumber: "$seaBatchNumber",
                            deliveryPaperNumber: "$seaBatchInfo.deliveryPaperNumber",
                            productCode: "$productCode",
                            quantityLoaded: "$quantityLoaded",
                            totalCBM: "$totalCBM",
                            createdAt: "$createdAt"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    seaVoyageInfo: {
                        seaVoyageName: "$seaVoyageInfo.seaVoyageName",
                        seaVoyageNumber: "$seaVoyageInfo.seaVoyageNumber",
                        lineName: "$lineInfo.lineName",
                    },
                    seaContainerInfo: {
                        containerNumber: "$seaContainerInfo.containerNumber",
                        containerCompanyName: "$containerCompanyInfo.containerCompanyName"
                    },
                    batchAssignments: 1,
                }
            }
        ]);

        const voyage = await SeaVoyage.findById(seaVoyageId).select("seaVoyageNumber branchId").lean();
        await logUserActivity({
            req,
            action: "export_container",
            module: "sea_voyage",
            entityType: "SeaContainer",
            entityId: seaContainerId,
            voyageId: seaVoyageId,
            voyageNumber: voyage?.seaVoyageNumber,
            branchId: voyage?.branchId,
            description: `Exported container ${containerData[0]?.seaContainerInfo?.containerNumber || seaContainerId} data from sea voyage ${voyage?.seaVoyageNumber || seaVoyageId}`,
            metadata: {
                assignmentCount: containerData[0]?.batchAssignments?.length || 0,
                status: status || "all"
            }
        });

        res.status(200).json({
            success: true,
            ...containerData[0]
        });

    } catch (error) {
        console.log('Error in exportContainerData controller', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}
