import Package from "../models/package.model.js";
import UploadedProduct from "../models/uploadedProduct.model.js";

export const trackProduct = async (req, res) => {
    try {
        const { trackingNumber } = req.params;

        if (!trackingNumber) {
            return res.status(400).json({ message: "Tracking Number is required!" });
        }

        const productDetails = await UploadedProduct.find({ trackingNumber }).populate("uploadedBy", "username");

        if (productDetails.length === 0) {
            return res.status(404).json({ success: false, message: "Product does not exist!" });
        }

        const productIds = productDetails.map((p) => p._id);

        const packages = await Package.find({ products: { $in: productIds } }).populate("packagedBy", "username").populate("goniId", "goniName");

        const result = productDetails.map((product) => {
            const pkg = packages.find((p) =>
                p.products.some((pid) => pid.toString() === product._id.toString())
            );

            return {
                ...product.toObject(),
                packageDetails: pkg || null
            }
        })

        return res.status(200).json({
            success: true,
            message: "Product retrieved successfully!",
            result
        });
    } catch (error) {
        console.log("Error in trackProduct controller", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}