"use strict";
import express from 'express'
import Loaders from '@/loaders';
import helmet from 'helmet';
import path from 'path';
import dotenv from 'dotenv';
import * as console from "node:console";
import AppConfig from "@/configs/app.config";
import env from '@/configs/env';

async function startServer() {
    const listenPort = AppConfig.app_port;
    const isProduction = env.NODE_ENV === 'production';
    console.log(`environment: ${process.env.NODE_ENV}`);
    const app = express();
    dotenv.config({
        path: path.resolve(__dirname, isProduction ? '../.env' : '../.env')
    }); // Load environment variables from .env file
    app.use(helmet()); // Secure your app by setting various HTTP headers
    Loaders({ expressApp: app }).then(() => {
        app.listen(listenPort, () => {
            console.log(`Server is running on http://localhost:${listenPort}`);
        });
    });
}

startServer().then(() => console.log('server started')).catch((err) => console.error(err));