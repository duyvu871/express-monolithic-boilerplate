"use strict";
import express from 'express'
import Loaders from '@/loaders';
import helmet from 'helmet';
import cors from 'cors';
import * as process from 'node:process';
import path from 'path';
import dotenv from 'dotenv';
import * as console from "node:console";
import AppConfig from "@/configs/app.config";

async function startServer() {
    const listenPort = AppConfig.app_port;
    const app = express();
    dotenv.config({
        path: path.resolve(__dirname, '../.env')
    }); // Load environment variables from .env file
    app.use(helmet()); // Secure your app by setting various HTTP headers
    await Loaders({ expressApp: app });
    app.listen(listenPort, () => {
        console.log(`Server is running on http://localhost:${listenPort}`);
    });
}

startServer().then(() => console.log('server started')).catch((err) => console.error(err));