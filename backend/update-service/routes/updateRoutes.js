// updateservice/routes/updateRoutes
import express from 'express';
const router = express.Router();
import updateController from '../controllers/updateController.js';


router.put('/update-one/:id', updateController.updateData);

export default router;