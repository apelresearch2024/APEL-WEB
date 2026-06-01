import express from 'express';
import { 
  adminLogin, 
  forgotPassword, 
  resetPassword,
  updatePassword 
} from '../controllers/authController.js';

const authRouter = express.Router();

authRouter.post('/login', adminLogin);

authRouter.post('/forgot-password', forgotPassword);


authRouter.post('/reset-password/:token', resetPassword);
authRouter.put('/update-password', updatePassword);
export default authRouter;