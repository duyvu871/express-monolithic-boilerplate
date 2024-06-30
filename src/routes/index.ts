import {Express} from "express";
import AppConfig from "@/configs/app.config";
import { userRouter } from '@/routes/user.route';
import { authRouter } from '@/routes/auth.route';

export function LoadRoutes({app}: {app: Express}) {
    app.get(AppConfig.api.api_test, (req, res) => {
        res.send('Hello World');
    });
    app.use('/api/v1/user', userRouter);
    app.use('/api/v1/auth', authRouter);
}