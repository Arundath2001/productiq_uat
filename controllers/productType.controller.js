import ProductType from "../models/productType.mode.js";

export const createProductType = async (req, res) => {
    try {
        const { itemName } = req.body;
        const branchId = req.user.branchId;

        if (!itemName) {
            return res.status(404).json({
                success: false,
                message: "Item name is required!"
            });
        }

        const exisitngProductType = await ProductType.findOne({ itemName }).lean();


        if (exisitngProductType) {
            return res.status(404).json({
                success: false,
                message: "Item already exists!"
            });
        }

        const newProductType = await ProductType({
            itemName,
            createdBy: req.user._id
        });

        await newProductType.save();

        res.status(200).json({
            success: true,
            message: `${itemName} created successfully`,
            newProductType
        });
    } catch (error) {
        console.log("Error in createProductType controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getProductType = async (req, res) => {
    try {

        const searchQuery = req.query.search || '';

        const filter = {};

        if (searchQuery) {
            filter.itemName = { $regex: searchQuery, $options: 'i' }
        }

        const productTypes = await ProductType.find(filter).lean();

        return res.status(200).json({
            success: true,
            productTypes
        })
    } catch (error) {
        console.log("Error in getProductType controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const deleteProductType = async (req, res) => {
    try {
        const { itemTypeId } = req.params;

        const item = await ProductType.findById(itemTypeId).lean();

        if (!item) {
            return res.status(404).json({ success: false, message: "Item does not exist" });
        }

        await ProductType.findByIdAndDelete(itemTypeId);

        res.status(200).json({
            success: true,
            message: `${item.itemName} deleted successfully`
        });

    } catch (error) {
        console.log("Error in deleteProductType controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}