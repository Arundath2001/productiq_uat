import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { changeSeaContainerVoyage, createSeaContainer, deleteSeaContainer, getSeaContainerByBranch, getSeaContainerByBranchAndVoyage, getTotalSeaContainerByBranch } from "../controllers/seaContainer.controller.js";

const router = express.Router();

router.post('/create', protectRoute, createSeaContainer);

router.get('/sea-voyage/:seaVoyageId', protectRoute, getSeaContainerByBranchAndVoyage);

router.get('', protectRoute, getSeaContainerByBranch);

router.get('/total-container', protectRoute, getTotalSeaContainerByBranch);

router.patch('/:containerId/voyage', protectRoute, changeSeaContainerVoyage);

router.delete('/:containerId', protectRoute, deleteSeaContainer);

export default router;
