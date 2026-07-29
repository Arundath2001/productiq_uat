import AppImage from "../models/appImage.model.js";
import fs from "fs/promises";
import path from "path";

export const getAppVersion = async (req, res) => {
    try {
        const { currentVersion, platform } = req.query;

        console.log(currentVersion, platform);

        const versionInfo = {
            minimumVersion: "1.2.0",
            latestVersion: "1.6.0",
            forceUpdate: false,
            updateMessage: "A new version is available with important bug fixes and improvements.",
            maintenanceMode: false,
            maintenanceMessage: ""
        };

        if (platform === "android") {
            versionInfo.latestVersion = "2.1.0";

            if (compareVersions(currentVersion, "2.1.0") < 0) {
                versionInfo.forceUpdate = true;
                versionInfo.minimumVersion = "2.1.0";
                versionInfo.updateMessage = "Version 2.1.0 is here! New image preview design with download support, along with performance enhancements and bug fixes.";
            }
        } else if (platform === "ios") {
            versionInfo.latestVersion = "2.1.1";

            if (compareVersions(currentVersion, "2.1.1") < 0) {
                versionInfo.forceUpdate = true;
                versionInfo.minimumVersion = "2.1.1";
                versionInfo.updateMessage = "Version 2.1.1 is here! New image preview design with download support, along with performance enhancements and bug fixes.";
            }
        }

        console.log(`Version check: User on ${platform} ${currentVersion}, Latest: ${versionInfo.latestVersion}, Force: ${versionInfo.forceUpdate}`);

        res.status(200).json(versionInfo);

    } catch (error) {
        console.error("Error in getAppVersion controller: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

const isSuperAdmin = (user) => {
    return Array.isArray(user?.adminRoles) && user.adminRoles.includes("superadmin");
};

const getFileUrl = (req, filename) => {
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    return `${baseUrl}/uploads/${filename}`;
};

const deleteUploadedFile = async (filename) => {
    if (!filename) return;

    const uploadsPath = path.resolve("uploads");
    const filePath = path.resolve(uploadsPath, filename);

    if (!filePath.startsWith(uploadsPath)) return;

    try {
        await fs.unlink(filePath);
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.error("Error deleting app image file: ", error.message);
        }
    }
};

const getBodyArrayValue = (value, index) => {
    if (Array.isArray(value)) return value[index] || "";
    return index === 0 ? value || "" : "";
};

export const getAppImages = async (req, res) => {
    try {
        const images = await AppImage.find()
            .populate("uploadedBy", "username")
            .populate("updatedBy", "username")
            .sort({ createdAt: -1 });

        res.status(200).json({ images });
    } catch (error) {
        console.error("Error in getAppImages controller: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const uploadAppImages = async (req, res) => {
    try {
        if (!isSuperAdmin(req.user)) {
            return res.status(403).json({ message: "Only super admin can upload app images" });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Please choose at least one image" });
        }

        const images = await AppImage.insertMany(
            req.files.map((file, index) => ({
                imageUrl: getFileUrl(req, file.filename),
                originalName: file.originalname,
                filename: file.filename,
                mimetype: file.mimetype,
                size: file.size,
                displayText: getBodyArrayValue(req.body.displayTexts, index).trim(),
                uploadedBy: req.user._id,
                updatedBy: req.user._id,
            }))
        );

        const populatedImages = await AppImage.find({
            _id: { $in: images.map((image) => image._id) },
        })
            .populate("uploadedBy", "username")
            .populate("updatedBy", "username");

        res.status(201).json({
            message: `${images.length} image${images.length > 1 ? "s" : ""} uploaded successfully`,
            images: populatedImages,
        });
    } catch (error) {
        console.error("Error in uploadAppImages controller: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateAppImage = async (req, res) => {
    try {
        if (!isSuperAdmin(req.user)) {
            return res.status(403).json({ message: "Only super admin can update app images" });
        }

        const { imageId } = req.params;
        const image = await AppImage.findById(imageId);

        if (!image) {
            return res.status(404).json({ message: "App image not found" });
        }

        const hasDisplayText = Object.prototype.hasOwnProperty.call(req.body, "displayText");

        if (!req.file && !hasDisplayText) {
            return res.status(400).json({ message: "Please choose an image or enter text to update" });
        }

        const previousFilename = image.filename;

        if (req.file) {
            image.imageUrl = getFileUrl(req, req.file.filename);
            image.originalName = req.file.originalname;
            image.filename = req.file.filename;
            image.mimetype = req.file.mimetype;
            image.size = req.file.size;
        }

        if (hasDisplayText) {
            image.displayText = req.body.displayText.trim();
        }

        image.updatedBy = req.user._id;

        await image.save();

        if (req.file) {
            await deleteUploadedFile(previousFilename);
        }

        const updatedImage = await AppImage.findById(image._id)
            .populate("uploadedBy", "username")
            .populate("updatedBy", "username");

        res.status(200).json({
            message: "Image updated successfully",
            image: updatedImage,
        });
    } catch (error) {
        console.error("Error in updateAppImage controller: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteAppImage = async (req, res) => {
    try {
        if (!isSuperAdmin(req.user)) {
            return res.status(403).json({ message: "Only super admin can delete app images" });
        }

        const { imageId } = req.params;
        const image = await AppImage.findById(imageId);

        if (!image) {
            return res.status(404).json({ message: "App image not found" });
        }

        await AppImage.findByIdAndDelete(imageId);
        await deleteUploadedFile(image.filename);

        res.status(200).json({ message: "Image deleted successfully", imageId });
    } catch (error) {
        console.error("Error in deleteAppImage controller: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

function compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const part1 = parts1[i] || 0;
        const part2 = parts2[i] || 0;

        if (part1 > part2) return 1;
        if (part1 < part2) return -1;
    }

    return 0;
}
