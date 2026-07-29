import mongoose from "mongoose";

const appImageSchema = mongoose.Schema(
    {
        imageUrl: {
            type: String,
            required: true,
        },
        originalName: {
            type: String,
            required: true,
        },
        filename: {
            type: String,
            required: true,
        },
        mimetype: {
            type: String,
            required: true,
        },
        size: {
            type: Number,
            required: true,
        },
        displayText: {
            type: String,
            default: "",
            trim: true,
            maxlength: 500,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

appImageSchema.index({ createdAt: -1 });

const AppImage = mongoose.model("AppImage", appImageSchema);

export default AppImage;
