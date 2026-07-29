import express from "express";
import { assignVoyageAndContainer, exportContainerData, getBatchAssignCompany, getSeaBatchAssignByCompany, getSeaBatchAssignBySeaVoyage, getSeaBatchAssignCompanyData, getSeaBatchDetailsByCompany, getSeaBatchDetailsByCompanyWise, getSeaVoyageDetailsByBatch } from "../controllers/seaBatchAssign.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const route = express.Router();

route.post('/assign', protectRoute, assignVoyageAndContainer);

route.get('/sea-container/:seaContainerId/companies', protectRoute, getBatchAssignCompany);

route.get('/:branchId/sea-container/:seaContainerId/company/:companyCode/batches', getSeaBatchDetailsByCompany);

route.get('/:seaBatchId/company/:companyCode', protectRoute, getSeaBatchAssignByCompany);

route.get('/companies/:seaContainerId', getSeaBatchDetailsByCompanyWise);

route.get('/company-data/:companyCode/container/:seaContainerId', getSeaBatchAssignCompanyData);

route.get('/sea-voyage/:seaVoyageId/:companyCode', getSeaBatchAssignBySeaVoyage);

route.get('/:seaBatchId/sea-voyage', getSeaVoyageDetailsByBatch);

route.get('/sea-voyage/:seaVoyageId/sea-container/:seaContainerId', protectRoute, exportContainerData);


export default route;
