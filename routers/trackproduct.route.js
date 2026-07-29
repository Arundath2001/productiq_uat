import express from "express";
import { trackProduct } from "../controllers/trackproduct.controller.js";

const router = express.Router();

router.get("/:trackingNumber", trackProduct);

export default router