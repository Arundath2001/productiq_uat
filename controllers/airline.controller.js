import Airline from "../models/airline.model.js";

export const createAirline = async (req, res) => {
    try {
        const { airlineName, branchId } = req.body;

        if (!airlineName) {
            return res.status(400).json({
                success: false,
                message: "Airline name is a required field"
            });
        }

        if (!branchId) {
            return res.status(400).json({
                success: false,
                message: "Branch ID is required. Please ensure you are logged in as a Branch Admin."
            });
        }

        const existingAirline = await Airline.findOne({ airlineName, branchId, status: 0 }).lean();

        if (existingAirline) {
            return res.status(400).json({
                success: false,
                message: "Airline name already exists in this branch"
            });
        }

        const newAirline = new Airline({
            airlineName,
            createdBy: req.user._id,
            branchId
        });

        await newAirline.save();

        res.status(200).json({
            success: true,
            newAirline,
            message: `${airlineName} Airline created successfully`
        })

    } catch (error) {
        console.log("Error in createAirline controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getAirlines = async (req, res) => {
    try {
        const { branchId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const searchQuery = req.query.search || ""

        if (!branchId) {
            return res.status(400).json({
                success: false,
                message: "Branch ID is required to fetch airlines"
            });
        }

        const filter = { status: 0, branchId }

        if (searchQuery) {
            filter.airlineName = { $regex: searchQuery, $options: 'i' }
        }

        const totalAirlines = await Airline.countDocuments(filter);
        const totalPages = Math.ceil(totalAirlines / limit);

        const airlines = await Airline.find(filter).sort({ createdAt: -1 }).limit(limit).skip(skip).lean();

        res.status(200).json({
            success: true,
            message: "Airlines fetched successfully",
            airlines,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalAirlines,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        })

    } catch (error) {
        console.log("Error in getAirlines controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const updateAirlineById = async (req, res) => {
    try {
        const { airlineId } = req.params;
        const { airlineName } = req.body;

        if (!airlineId) {
            return res.status(400).json({
                success: false,
                message: "Airline ID is required"
            });
        }

        if (!airlineName) {
            return res.status(400).json({
                success: false,
                message: "Airline name is required"
            });
        }

        const airline = await Airline.findById(airlineId);

        if (!airline) {
            return res.status(404).json({
                success: false,
                message: "Airline not found!"
            });
        }

        // Check if another airline with the same name exists in the same branch
        const existingAirline = await Airline.findOne({ 
            airlineName, 
            branchId: airline.branchId,
            _id: { $ne: airlineId },
            status: 0
        }).lean();

        if (existingAirline) {
            return res.status(400).json({
                success: false,
                message: "Airline name already exists in this branch"
            });
        }

        airline.airlineName = airlineName;
        await airline.save();

        res.status(200).json({
            success: true,
            airline,
            message: "Airline updated successfully"
        });

    } catch (error) {
        console.log("Error in updateAirlineById controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const deleteAirlineById = async (req, res) => {
    try {
        const { airlineId } = req.params;

        if (!airlineId) {
            return res.status(400).json({
                success: false,
                message: "Airline ID is required to delete"
            });
        }

        const airline = await Airline.findById(airlineId);

        if (!airline) {
            return res.status(404).json({
                success: false,
                message: "Airline not found!"
            });
        }

        airline.status = 1;
        await airline.save();

        res.status(200).json({
            success: true,
            message: `${airline.airlineName} deleted successfully`
        });

    } catch (error) {
        console.log("Error in deleteAirlineById controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}
