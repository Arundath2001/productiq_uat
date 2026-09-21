import mongoose from "mongoose";

const notificationSchema = mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        default: (process.env.APP_NAME || "Aswaq Forwarder"),
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: Number,
        enum: [0, 1],
        default: 0,
        description: "0 - normal, 1 - alert",
        index: true,
    },
    type: {
        type: Number,
        enum: [0, 1, 2, 3, 4],
        default: 0,
        description: "0 - manual, 1 - upload, 2 - dispatch, 3 - delay, 4 - received",
        index: true,
    },
    cargoType: {
        type: Number,
        enum: [0, 1, 2],
        default: 0,
        description: "0 - general, 1 - air, 2 - sea",
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
    },
    entityType: {
        type: Number,
        enum: [0, 1, 2, 3, 4, 5],
        default: 0,
        description: "0 - Manual, 1 - Voyage, 2 - SeaVoyage, 3 - UploadedProduct, 4 - SeaBatch, 5 - SeaBatchAssign",
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
    },
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    isRead: {
        type: Number,
        enum: [0, 1],
        default: 0,
        description: "0 - unread, 1 - read",
        index: true,
    },
    readAt: {
        type: Date,
        default: null,
        index: true,
    },
}, {
    timestamps: true,
});

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, readAt: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, category: 1, createdAt: -1 });
notificationSchema.index({ companyId: 1, createdAt: -1 });
notificationSchema.index({ branchId: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
