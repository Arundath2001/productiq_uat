import express from "express";
import { createAirline, deleteAirlineById, getAirlines, updateAirlineById } from "../controllers/airline.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post('/create', protectRoute, createAirline);
router.get('/:branchId', getAirlines);
router.put('/:airlineId', protectRoute, updateAirlineById);
router.delete('/:airlineId', protectRoute, deleteAirlineById);

export default router;
