import { Router } from 'express';
import UserController from '@/controllers/user.controller';
import { validateBody, validateHeader } from '@/middlewares/validate';
import UserValidation from '@/validations/user.validation';

export const userRouter: Router = Router();
console.log('auth routing loaded: ', '/api/v1/user');

userRouter.route('/').get(validateHeader(UserValidation.getUserHeaders), UserController.getUsers);