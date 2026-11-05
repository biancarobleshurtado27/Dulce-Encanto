import {Router} from 'express';
import {register,login,me} from '../controllers/authController.js';
import {authMiddleware} from '../middlewares/authMiddleware.js';
export const authRoutes=Router();
authRoutes.post('/register',register);
authRoutes.post('/login',login);
authRoutes.get('/me',authMiddleware,me);
