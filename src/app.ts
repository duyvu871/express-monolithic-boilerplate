"use strict";
import express from 'express'
import Loaders from '@/loaders';
import helmet from 'helmet';
import path from 'path';
import dotenv from 'dotenv';
import * as console from "node:console";
import AppConfig from "@/configs/app.config";
import env, { loadEnv } from '@/configs/env';
import * as process from 'node:process';

async function startServer() {
    const isProduction = process.env.NODE_ENV === 'production';
    const DOTENV = dotenv.config({
        path: path.resolve(__dirname, isProduction ? '../.env' : '../.env')
    }); // Load environment variables from .env file
    // console.log(process.env);
    loadEnv(DOTENV.parsed);
    const listenPort = process.env.PORT;
    console.log(`listenPort: ${listenPort}`);
    console.log(`environment: ${process.env.NODE_ENV}`);

    const app = express();

    app.use(helmet({
        crossOriginResourcePolicy: false,
    })); // Secure your app by setting various HTTP headers
    app.listen(listenPort, () => {
        console.log(`Server is running on http://localhost:${listenPort}`);
    });
    await Loaders({ expressApp: app });
}

startServer().then(() => console.log('server started')).catch((err) => console.error(err));