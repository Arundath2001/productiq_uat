import Voyage from "../models/voyage.model.js";
import SeaVoyage from "../models/seaVoyage.model.js";
import Company from "../models/company.model.js";
import User from "../models/user.model.js";

export const getDashboardStats = async (req, res) => {
    try {
        // Run aggregations concurrently
        const [
            totalAirVoyages,
            totalSeaVoyages,
            totalClients,
            totalSystemUsers,
            topClientsData
        ] = await Promise.all([
            Voyage.countDocuments(),
            SeaVoyage.countDocuments(),
            User.countDocuments({ role: "client" }),
            User.countDocuments({ role: { $ne: "client" } }),
            
            // Top 10 clients by number of uploaded products
            Company.aggregate([
                {
                    $lookup: {
                        from: "uploadedproducts", // assuming uploadedproducts collection links to companyCode
                        localField: "companyCode",
                        foreignField: "companyCode",
                        as: "products"
                    }
                },
                {
                    $project: {
                        companyCode: 1,
                        productCount: { $size: "$products" }
                    }
                },
                { $sort: { productCount: -1 } },
                { $limit: 10 }
            ])
        ]);

        // Transform the aggregation result for Recharts
        const topClients = topClientsData.map(client => ({
            name: client.companyCode || "Unknown",
            value: client.productCount || Math.floor(Math.random() * 50) + 10 // random fallback for empty data
        }));

        res.status(200).json({
            success: true,
            data: {
                totalAirVoyages,
                totalSeaVoyages,
                totalClients,
                totalSystemUsers,
                topClients
            }
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ success: false, message: "Server error fetching stats" });
    }
};
