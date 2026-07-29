import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { closeSeaVoyage, createSeaVoyage, deleteSeaVoyage, getPendingSeaVoyageOptions, getSeaVoyageByCompanyAndBranchId, getSeaVoyagesByBranchId, updateCompletedVoyageStatus } from "../controllers/seaVoyage.controller.js";

const router = express.Router();

router.post('/create', protectRoute, createSeaVoyage);

router.get('/', protectRoute, protectRoute, getSeaVoyagesByBranchId);

router.get('/options/pending', protectRoute, getPendingSeaVoyageOptions);

router.delete('/delete/:seaVoyageId', protectRoute, deleteSeaVoyage);

router.post('/close/:seaVoyageId', protectRoute, closeSeaVoyage);

router.get('/:branchId', protectRoute, getSeaVoyageByCompanyAndBranchId);

router.put('/completed-voyage/update/:voyageId', protectRoute, updateCompletedVoyageStatus);

export default router;
