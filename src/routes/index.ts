import {Express} from "express";
import AppConfig from "@/configs/app.config";

export function LoadRoutes({app}: {app: Express}) {
    app.get(AppConfig.api.api_test, (req, res) => {
        res.send('Hello World');
    });
}