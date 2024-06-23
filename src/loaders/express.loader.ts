import express, {Express} from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import flash from "connect-flash";
import {LoadRoutes} from "@/routes";
import AppConfig from "@/configs/app.config";

export default ({app}: {app: Express}) => {
    app.get('/health', (req, res) => {
        res.status(200).send('OK').end();
    }); // server health check
    app.head('/health', (req, res) => {
        res.status(200).send('OK').end();
    }); // server health check

    app.enable('trust proxy'); // trust first proxy
    app.use(cors({})); // enable cors
    app.use(bodyParser.json({
        limit: '10mb'
    })); // parse application/json
    app.use(bodyParser.urlencoded({
        extended: true
    })); // parse application/x-www-form-urlencoded
    app.use(bodyParser.text()); // parse text/plain
    app.use(cookieParser()); // parse cookies
    app.use(flash()); // flash messages
    app.use(express.static(AppConfig.path.public)); // serve static files
    LoadRoutes({app}); // load routes
};