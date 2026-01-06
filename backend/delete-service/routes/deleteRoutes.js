// deleteservice/routes/deleteRoutes
import express from 'express';
const router = express.Router();
import deleteController from '../controllers/deleteController.js';

// delete multiple route
router.delete('/delete', deleteController.deleteData);

// delete one route
router.delete('/delete/:id', deleteController.deleteData);

export default router;