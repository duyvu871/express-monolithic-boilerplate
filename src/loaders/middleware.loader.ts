import {response_header_template} from '@/helpers/response_header_template.helper'
import {Express} from "express";
import { morganMiddleware } from '@/configs/morgan';

export default function middleware_loader({app}: {app: Express}) {
    app.use((req, res, next) => {
        response_header_template(res);
        next();
    });
}