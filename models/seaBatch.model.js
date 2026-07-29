import mongoose from "mongoose";

const quantityTypeSchema = mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['goni', 'pallet', 'ctns']
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false });

const seaBatchSchema = mongoose.Schema({
    seaBatchNumber: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
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
    itemName: {
        type: String,
        required: true
    },
    deliveryPaperNumber: {
        type: String,
        required: true
    },
    supplierName: {
        type: String,
        required: true
    },
    totalQuantity: {
        type: Number,
        required: true
    },
    quantityTypes: {
        type: [quantityTypeSchema],
        required: true,
    },
    availableQuantity: {
        type: Number,
        min: 0,
        required: true
    },
    loadedQuantity: {
        type: Number,
        min: 0,
        default: 0
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
        required: true
    },
    loadingStatus: {
        type: String,
        enum: ["available", "partially-loaded", "fully-loaded"],
        default: "available"
    },
    status: {
        type: String,
        enum: ["active", "completed", "cancelled"],
        default: "active"
    },
    deliveryPaperImages: {
        type: [String],
        default: null
    },
    productImages: {
        type: [String],
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});


seaBatchSchema.methods.canLoad = function (quantity) {
    return this.availableQuantity >= quantity;
};

seaBatchSchema.methods.updateQuantityAfterLoad = function (quantity) {
    this.loadedQuantity += quantity;
    this.availableQuantity -= quantity;

    if (this.availableQuantity === 0) {
        this.loadingStatus = "fully-loaded"
    } else if (this.loadedQuantity > 0) {
        this.loadingStatus = "partially-loaded"
    }

    return this.save();

}

const SeaBatch = mongoose.model("SeaBatch", seaBatchSchema);

export default SeaBatch;