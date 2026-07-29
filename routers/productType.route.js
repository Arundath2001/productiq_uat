import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createProductType, deleteProductType, getProductType } from "../controllers/productType.controller.js";

const route = express.Router();

route.post('/create', protectRoute, createProductType);

route.get('/', protectRoute, getProductType);

route.delete('/:itemTypeId', protectRoute, deleteProductType);

export default route;