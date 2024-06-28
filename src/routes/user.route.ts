import { Router } from 'express';
import UserController from '@/controllers/user.controller';

export const userRouter: Router = Router();
console.log('auth routing loaded: ', '/api/v1/user');

userRouter.route('/').get();