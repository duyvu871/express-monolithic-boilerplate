import { Router } from 'express';
import { validateBody } from '@/middlewares/validate';
import AuthValidation from '@/validations/auth.validation';
import UserController from '@/controllers/user.controller';
import AuthController from '@/controllers/auth.controller';

export const authRouter: Router = Router();
console.log('auth routing loaded: ', '/api/v1/auth');

authRouter.route('/register').post(validateBody(AuthValidation.registerBody), AuthController.Register);
authRouter.route('/login').post(validateBody(AuthValidation.loginBody), AuthController.Login);
