import mongoose from "mongoose";
import SavedCode from "../models/savedCode.model.js";
import SeaBatch from "../models/seaBatch.model.js";
import SeaBatchAssign from "../models/seaBatchAssign.model.js";
import User from "../models/user.model.js";
import { storeNotificationsForUsers } from "../lib/notificationService.js";

export const createSeaBatch = async (req, res) => {
    try {
        const { productId, deliveryPaperNumber, supplierName, totalQuantity, quantityTypes, itemName } = req.body;

        console.log(quantityTypes);

        let formatedQuantityTypes = quantityTypes;
        if (typeof formatedQuantityTypes === 'string') {
            try {
                formatedQuantityTypes = JSON.parse(quantityTypes)
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Quantity Type"
                });
            }
        }

        if (!productId || !deliveryPaperNumber || !supplierName || !totalQuantity) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const productDetails = await SavedCode.findById(productId).lean();

        if (!productDetails) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const generateRandomBatchNumber = () => {
            const now = new Date();

            return now.getFullYear().toString().slice(-2) +
                (now.getMonth() + 1).toString().padStart(2, '0') +
                now.getDate().toString().padStart(2, '0') +
                now.getHours().toString().padStart(2, '0') +
                now.getMinutes().toString().padStart(2, '0') +
                now.getSeconds().toString().padStart(2, '0');
        }

        const isValidDeliveryPaper = deliveryPaperNumber && deliveryPaperNumber.trim() !== '' && deliveryPaperNumber.trim().toLowerCase() !== 'nil';

        const batchSuffix = isValidDeliveryPaper ? deliveryPaperNumber.trim() : generateRandomBatchNumber();

        const seaBatchNumber = productDetails.productCode + '-' + batchSuffix;

        console.log(seaBatchNumber);


        const existingSeaBatch = await SeaBatch.findOne({ seaBatchNumber }).lean();

        if (existingSeaBatch) {
            return res.status(400).json({
                success: false,
                message: `Sea batch with ${seaBatchNumber} already exists`
            });
        }

        // const deliveryPaperImage = req.files?.["deliveryPaperImage"]?.[0]?.path || null;
        // const productImages = req.files?.["productImages"]?.map(file => file.path) || [];

        const deliveryPaperImage = req.files?.["deliveryPaperImage"]?.[0]
            ? `${process.env.BASE_URL}/${req.files["deliveryPaperImage"][0].path.replace(/\\/g, '/')}`
            : null;

        const productImages = req.files?.["productImages"]?.map(file =>
            `${process.env.BASE_URL}/${file.path.replace(/\\/g, '/')}`
        ) || [];

        const newSeaBatch = new SeaBatch({
            seaBatchNumber,
            productId,
            deliveryPaperNumber,
            supplierName,
            itemName,
            totalQuantity,
            createdBy: req.user._id,
            branchId: req.user.branchId,
            availableQuantity: totalQuantity,
            companyCode: productDetails.companyCode,
            productCode: productDetails.productCode,
            deliveryPaperImages: deliveryPaperImage,
            productImages,
            quantityTypes: formatedQuantityTypes
        });

        await newSeaBatch.save();

        const clients = await User.find({ role: "client", companyCode: productDetails.companyCode });
        const branchName = req.user.branchId?.branchName || "your branch";
        const notificationMessage = `A new sea cargo batch ${seaBatchNumber} for product code ${productDetails.productCode} has been received at ${branchName}`;

        await storeNotificationsForUsers({
            users: clients,
            message: notificationMessage,
            category: "normal",
            type: "upload",
            cargoType: "sea",
            branchId: req.user.branchId?._id || req.user.branchId,
            entityType: "SeaBatch",
            entityId: newSeaBatch._id,
            sentBy: req.user._id,
            metadata: {
                seaBatchNumber,
                productCode: productDetails.productCode,
                quantity: totalQuantity,
                quantityTypes: formatedQuantityTypes,
            },
        });

        res.status(201).json({
            success: true,
            message: "Sea batch created successfully",
            data: newSeaBatch
        });

    } catch (error) {
        console.log('Error in createSeaBatch controller', error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const deleteSeaBatch = async (req, res) => {
    try {
        const { seaBatchId } = req.params;

        console.log(typeof (seaBatchId), seaBatchId, req.params);


        const existingSeaBatch = await SeaBatch.findById(seaBatchId).lean();

        if (!existingSeaBatch) {
            return res.status(400).json({
                success: false,
                message: "Sea batch does not exist"
            });
        }

        await SeaBatchAssign.deleteMany({ seaBatchId: seaBatchId });

        await SeaBatch.findByIdAndDelete(seaBatchId);

        res.status(200).json({
            success: true,
            message: `${existingSeaBatch.seaBatchNumber} sea batch deleted successfully`
        });

    } catch (error) {
        console.log("Error in deleteSeaBatch controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const getBatchesByBranch = async (req, res) => {
    try {

        const branchId = req.user.branchId;

        const status = req.query.status || 'active';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const searchQuery = req.query.search || "";

        if (!branchId) {
            return res.status(404).json({
                success: false,
                message: "The user does not have a branch"
            });
        }

        const filter = { branchId, status }

        if (searchQuery) {
            filter.productCode = { $regex: searchQuery, $options: 'i' }
        }

        const totalCount = await SeaBatch.countDocuments(filter);

        const seaBatches = await SeaBatch.find(filter).limit(limit).skip(skip).lean();

        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            success: true,
            message: `Batch details fetched successfully`,
            seaBatches,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalCount,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        })

    } catch (error) {
        console.log("Error in getBatchesByBranch controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getBatchDetails = async (req, res) => {
    try {
        const { seaBatchNumber } = req.params;
        const branchId = req.user.branchId;

        if (!branchId) {
            return res.status(404).json({
                success: false,
                message: "The user does not have a branch"
            });
        }

        const seaBatchDetails = await SeaBatch.findOne({ seaBatchNumber, branchId }).select('availableQuantity totalQuantity seaBatchNumber').lean();

        if (!seaBatchDetails) {
            return res.status(404).json({
                success: false,
                message: "Sea batch not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Batch details fetched successfully",
            seaBatchDetails
        });

        console.log(seaBatchDetails);


    } catch (error) {
        console.log("Error in getSeaBatchDetails controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getSeaBatchByCompany = async (req, res) => {
    try {
        const companyCode = req.user.companyCode;
        const { branchId } = req.params;

        const status = req.query.status || 'active';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const searchQuery = req.query.search || "";

        console.log(status);


        if (!companyCode) {
            return res.status(400).json({
                success: false,
                message: "The user does not have company code"
            });
        }

        const filter = { companyCode, branchId: new mongoose.Types.ObjectId(branchId), status }

        if (searchQuery) {
            filter.seaBatchNumber = { $regex: searchQuery, $options: 'i' }
        }

        const totalBatchCount = await SeaBatch.countDocuments(filter);
        const totalBatchPages = Math.ceil(totalBatchCount / limit);


        const seaBatches = await SeaBatch.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: "seabatchassigns",
                    localField: "_id",
                    foreignField: "seaBatchId",
                    as: "assignments"
                }
            },
            {
                $lookup: {
                    from: "seavoyages",
                    localField: "assignments.seaVoyageId",
                    foreignField: "_id",
                    as: "voyages"
                }
            },
            {
                $addFields: {
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
                $project: {
                    assignments: 0,
                    voyages: 0
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]);


        res.status(200).json({
            success: true,
            message: "Batch and assignment details fetched successfully",
            seaBatches,
            pagination: {
                currentPage: page,
                totalPages: totalBatchPages,
                totalItems: totalBatchCount,
                hasNextPage: page < totalBatchPages,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.log("Error in getSeaBatchByCompany controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getSeaBatchesByBranch = async (req, res) => {
    try {
        const { branchId } = req.params;

        const status = req.query.status || 'active';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const searchQuery = req.query.search || "";

        console.log(status);

        const filter = { branchId: new mongoose.Types.ObjectId(branchId) }

        if (searchQuery) {
            filter.$or = [
                { seaBatchNumber: { $regex: searchQuery, $options: 'i' } },
                { productCode: { $regex: searchQuery, $options: 'i' } },
                { deliveryPaperNumber: { $regex: searchQuery, $options: 'i' } },
                { companyCode: { $regex: searchQuery, $options: 'i' } },
            ]
        }

        const totalBatchCount = await SeaBatch.countDocuments(filter);
        const totalBatchPages = Math.ceil(totalBatchCount / limit);


        const seaBatches = await SeaBatch.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: "seabatchassigns",
                    localField: "_id",
                    foreignField: "seaBatchId",
                    as: "assignments"
                }
            },
            {
                $lookup: {
                    from: "seavoyages",
                    localField: "assignments.seaVoyageId",
                    foreignField: "_id",
                    as: "voyages"
                }
            },
            {
                $lookup: {
                    from: "seacontainers",
                    localField: "assignments.seaContainerId",
                    foreignField: "_id",
                    as: "seacontainers"
                }
            },
            {
                $addFields: {
                    voyageNumbers: {
                        $map: {
                            input: "$voyages",
                            as: "voyage",
                            in: {
                                _id: "$$voyage._id",
                                seaVoyageNumber: "$$voyage.seaVoyageNumber"
                            }
                        }
                    },
                    seaContainers: {
                        $map: {
                            input: "$seacontainers",
                            as: "seacontainer",
                            in: {
                                id: "$$seacontainer._id",
                                seaContainerNumber: "$$seacontainer.containerNumber"
                            }
                        }
                    },
                    totalCBM: {
                        $sum: "$assignments.totalCBM"
                    }
                }
            },
            {
                $project: {
                    assignments: 0,
                    voyages: 0,
                    seacontainers: 0
                }
            },
            { $sort: { createdAt: -1 } },
            // { $skip: skip },
            // { $limit: limit }
        ]);


        res.status(200).json({
            success: true,
            message: "Batch and assignment details fetched successfully",
            seaBatches,
            pagination: {
                currentPage: page,
                totalPages: totalBatchPages,
                totalItems: totalBatchCount,
                hasNextPage: page < totalBatchPages,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.log("Error in getSeaBatchesByBranch controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Simplified version - focused on the fields being edited from your frontend
export const updateSeaBatch = async (req, res) => {
    try {
        const { seaBatchId } = req.params;
        const {
            deliveryPaperNumber,
            supplierName,
            totalCBM,
            itemName,
            seaContainers,
        } = req.body;

        console.log(deliveryPaperNumber, supplierName, totalCBM, itemName, seaContainers, voyageNumbers);


        // Validate seaBatchId
        if (!seaBatchId) {
            return res.status(400).json({
                success: false,
                message: "Sea batch ID is required"
            });
        }

        // Find the existing sea batch
        const existingSeaBatch = await SeaBatch.findById(seaBatchId);

        if (!existingSeaBatch) {
            return res.status(404).json({
                success: false,
                message: "Sea batch not found"
            });
        }

        // Prepare update object
        const updateData = {};

        if (deliveryPaperNumber !== undefined) {
            updateData.deliveryPaperNumber = deliveryPaperNumber;
        }

        if (supplierName !== undefined) {
            updateData.supplierName = supplierName;
        }

        if (totalCBM !== undefined) {
            updateData.totalCBM = parseFloat(totalCBM);
        }

        if (itemName !== undefined) {
            updateData.itemName = itemName;
        }

        if (seaContainers !== undefined) {
            updateData.seaContainers = seaContainers;
        }

        if (voyageNumbers !== undefined) {
            updateData.voyageNumbers = voyageNumbers;
        }

        // Update the sea batch
        const updatedSeaBatch = await SeaBatch.findByIdAndUpdate(
            seaBatchId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Sea batch updated successfully",
            seaBatch: updatedSeaBatch
        });

    } catch (error) {
        console.log('Error in updateSeaBatch controller', error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
