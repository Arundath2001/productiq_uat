import Airport from "../models/airport.model.js";

export const createAirport = async (req, res) => {
    try {
        const { airportName, branchId } = req.body;

        if (!airportName) {
            return res.status(400).json({
                success: false,
                message: "Airport name is a required field"
            });
        }

        if (!branchId) {
            return res.status(400).json({
                success: false,
                message: "Branch ID is required. Please ensure you are logged in as a Branch Admin."
            });
        }

        const existingAirport = await Airport.findOne({ airportName, branchId, status: 0 }).lean();

        if (existingAirport) {
            return res.status(400).json({
                success: false,
                message: "Airport name already exists in this branch"
            });
        }

        const newAirport = new Airport({
            airportName,
            createdBy: req.user._id,
            branchId
        });

        await newAirport.save();

        res.status(200).json({
            success: true,
            newAirport,
            message: `${airportName} Airport created successfully`
        })

    } catch (error) {
        console.log("Error in createAirport controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getAirports = async (req, res) => {
    try {
        const { branchId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const searchQuery = req.query.search || ""

        if (!branchId) {
            return res.status(400).json({
                success: false,
                message: "Branch ID is required to fetch airports"
            });
        }

        const filter = { status: 0, branchId }

        if (searchQuery) {
            filter.airportName = { $regex: searchQuery, $options: 'i' }
        }

        const totalAirports = await Airport.countDocuments(filter);
        const totalPages = Math.ceil(totalAirports / limit);

        const airports = await Airport.find(filter).sort({ createdAt: -1 }).limit(limit).skip(skip).lean();

        res.status(200).json({
            success: true,
            message: "Airports fetched successfully",
            airports,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalAirports,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        })

    } catch (error) {
        console.log("Error in getAirports controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const updateAirportById = async (req, res) => {
    try {
        const { airportId } = req.params;
        const { airportName } = req.body;

        if (!airportId) {
            return res.status(400).json({
                success: false,
                message: "Airport ID is required"
            });
        }

        if (!airportName) {
            return res.status(400).json({
                success: false,
                message: "Airport name is required"
            });
        }

        const airport = await Airport.findById(airportId);

        if (!airport) {
            return res.status(404).json({
                success: false,
                message: "Airport not found!"
            });
        }

        // Check if another airport with the same name exists in the same branch
        const existingAirport = await Airport.findOne({ 
            airportName, 
            branchId: airport.branchId,
            _id: { $ne: airportId },
            status: 0
        }).lean();

        if (existingAirport) {
            return res.status(400).json({
                success: false,
                message: "Airport name already exists in this branch"
            });
        }

        airport.airportName = airportName;
        await airport.save();

        res.status(200).json({
            success: true,
            airport,
            message: "Airport updated successfully"
        });

    } catch (error) {
        console.log("Error in updateAirportById controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const deleteAirportById = async (req, res) => {
    try {
        const { airportId } = req.params;

        if (!airportId) {
            return res.status(400).json({
                success: false,
                message: "Airport ID is required to delete"
            });
        }

        const airport = await Airport.findById(airportId);

        if (!airport) {
            return res.status(404).json({
                success: false,
                message: "Airport not found!"
            });
        }

        airport.status = 1;
        await airport.save();

        res.status(200).json({
            success: true,
            message: `${airport.airportName} deleted successfully`
        });

    } catch (error) {
        console.log("Error in deleteAirportById controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}
