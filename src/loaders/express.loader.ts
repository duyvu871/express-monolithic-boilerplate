import express, {Express} from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import flash from "connect-flash";
import {LoadRoutes} from "@/routes";
import AppConfig from "@/configs/app.config";
// import env from '@/configs/env';
// import morgan from 'morgan';
import * as process from 'node:process';
import { morganMiddleware } from '@/configs/morgan';

export default ({app}: {app: Express}) => {
    if (process.env.NODE_ENV === 'development') {
        app.use(morganMiddleware); // log http requests
    }
    app.get('/health', (req, res) => {
        res.status(200).send('OK').end();
    }); // server health check
    app.head('/health', (req, res) => {
        res.status(200).send('OK').end();
    }); // server health check

    app.enable('trust proxy'); // trust first proxy
    app.use(cors({
        origin: "*",
    })); // enable cors
    app.use(bodyParser.json({
        limit: '10mb'
    })); // parse application/json
    app.use(bodyParser.urlencoded({
        extended: true
    })); // parse application/x-www-form-urlencoded
    app.use(bodyParser.text()); // parse text/plain
    app.use(cookieParser()); // parse cookies
    app.use(flash()); // flash messages
    app.use('/storage', express.static(AppConfig.path.storage)); // serve static files
    console.log(AppConfig.path.storage);
    LoadRoutes({app}); // load routes
};