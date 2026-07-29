import mongoose from "mongoose";

const productTypeSchema = mongoose.Schema({
    itemName: {
        type: String,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});

const ProductType = mongoose.model("ProductType", productTypeSchema);

export default ProductType;