
import express from 'express';
import upload from '../middleware/multer.js';
import { submitApplication } from '../controllers/applicationController.js';

const applicationRouter = express.Router();

applicationRouter.post('/', upload.single('resume'), submitApplication);

export default applicationRouter;