import express from "express";
import { createAirport, deleteAirportById, getAirports, updateAirportById } from "../controllers/airport.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post('/create', protectRoute, createAirport);
router.get('/:branchId', getAirports);
router.put('/:airportId', protectRoute, updateAirportById);
router.delete('/:airportId', protectRoute, deleteAirportById);

export default router;
