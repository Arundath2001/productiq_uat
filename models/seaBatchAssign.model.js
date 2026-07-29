import mongoose from "mongoose";

const seaBatchAssignSchema = mongoose.Schema({
    seaBatchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SeaBatch",
        required: true
    },
    seaBatchNumber: {
        type: String,
        required: true,
        uppercase: true
    },
    seaVoyageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SeaVoyage",
        required: true
    },
    seaContainerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SeaContainer",
        required: true
    },
    quantityLoaded: {
        type: Number,
        required: true
    },
    cbmCaluculationType: {
        type: String,
        enum: ["identical", "non-identical", "manual"],
        required: true
    },
    length: {
        type: Number,
        required: function () {
            return this.cbmCaluculationType !== 'manual';
        },
        min: 0
    },
    width: {
        type: Number,
        required: function () {
            return this.cbmCaluculationType !== 'manual';
        },
        min: 0
    },
    height: {
        type: Number,
        required: function () {
            return this.cbmCaluculationType !== 'manual';
        },
        min: 0
    },
    weight: {
        type: Number,
        default: 0
    },
    totalCBM: {
        type: Number,
        required: true,
        min: 0
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SavedCode",
        required: true
    },
    productCode: {
        type: String,
        required: true
    },
    companyCode: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["active", "completed", "cancelled"],
        default: "active"
    },
    trackingStatus: {
        type: String,
        enum: ["loaded", "dispatched", "in-transit", "delivered", "delayed", "returned"],
        default: "loaded"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});

seaBatchAssignSchema.statics.calculateCBM = function (length, width, height, quantity, type) {
    if (type === 'identical') {
        return (length * width * height * quantity) / 1000000;
    } else if (type === 'non-identical') {
        return (length * width * height) / 1000000;
    }

    return 0;
};

const SeaBatchAssign = mongoose.model("SeaBatchAssign", seaBatchAssignSchema);

export default SeaBatchAssign;