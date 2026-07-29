import express from "express";
import { deleteAppImage, getAppImages, getAppVersion, updateAppImage, uploadAppImages } from "../controllers/appControl.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { uploadMultipleImages, uploadSingleImage } from "../lib/multerNew.js";

const router = express.Router();

router.get('/verion', getAppVersion);
router.get('/images/public', getAppImages);
router.get('/images', protectRoute, getAppImages);
router.post('/images', protectRoute, uploadMultipleImages('images', 10), uploadAppImages);
router.put('/images/:imageId', protectRoute, uploadSingleImage, updateAppImage);
router.delete('/images/:imageId', protectRoute, deleteAppImage);

export default router;
