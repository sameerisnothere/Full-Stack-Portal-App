// readservice/routes/readRoutes.js
import express from 'express';
const router = express.Router();
import readController from '../controllers/readController.js';

router.get('/get-data', readController.readData);

export default router;