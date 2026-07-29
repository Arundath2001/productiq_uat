import express from 'express';
import {
    createCompany,
    getAllCompanies,
    updateCompany,
    deleteCompany,
    getAllCompaniesV2
} from '../controllers/company.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();


router.post('/companies', protectRoute, createCompany);
router.get('/companies', protectRoute, getAllCompanies);
router.put('/companies/:id', protectRoute, updateCompany);
router.delete('/companies/:id', protectRoute, deleteCompany);

router.get('/companies/v2', protectRoute, getAllCompaniesV2);



export default router;