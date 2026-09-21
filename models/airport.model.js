import mongoose from "mongoose";

const airportSchema = mongoose.Schema({
    airportName: {
        type: String,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
        required: true
    },
    status: {
        type: Number,
        default: 0,
        enum: [0, 1] // 0 for active, 1 for deleted
    }
}, {
    timestamps: true
});

const Airport = mongoose.model("Airport", airportSchema);

export default Airport;
