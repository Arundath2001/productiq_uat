import mongoose from "mongoose";

const userActivitySchema = mongoose.Schema({
    actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    actorSnapshot: {
        username: { type: String, default: "System" },
        role: { type: String, default: "system" },
        adminRoles: { type: [String], default: [] }
    },
    action: {
        type: String,
        required: true,
        trim: true
    },
    module: {
        type: String,
        required: true,
        trim: true
    },
    entityType: {
        type: String,
        required: true,
        trim: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    voyageId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    voyageNumber: {
        type: String,
        default: null,
        trim: true
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
        default: null
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: {
        type: String,
        default: null
    },
    userAgent: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

userActivitySchema.index({ createdAt: -1 });
userActivitySchema.index({ actor: 1, createdAt: -1 });
userActivitySchema.index({ voyageId: 1, createdAt: -1 });
userActivitySchema.index({ branchId: 1, createdAt: -1 });
userActivitySchema.index({ module: 1, action: 1, createdAt: -1 });

const UserActivity = mongoose.model("UserActivity", userActivitySchema);

export default UserActivity;
