import express from "express";
import { createSeaBatch, deleteSeaBatch, getBatchDetails, getBatchesByBranch, getSeaBatchByCompany, getSeaBatchesByBranch, updateSeaBatch } from "../controllers/seaBatch.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { uploadSeaBatchImages } from "../lib/multerNew.js";

const route = express.Router();

route.post('/create', protectRoute, uploadSeaBatchImages, createSeaBatch);

route.put('/:seaBatchId', protectRoute, updateSeaBatch);

route.delete('/:seaBatchId', protectRoute, deleteSeaBatch);

route.get('/', protectRoute, getBatchesByBranch);

route.get('/:seaBatchNumber', protectRoute, getBatchDetails);

route.get('/company/:branchId', protectRoute, getSeaBatchByCompany);

route.get('/branch/:branchId', protectRoute, getSeaBatchesByBranch);

export default route;
