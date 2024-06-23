import {Express} from 'express';
import ExpressLoader from "@/loaders/express.loader";
import MiddlewareLoader from "@/loaders/middleware.loader";

export default async function createLoader({expressApp}: {expressApp: Express}) {
    ExpressLoader({app: expressApp});
    MiddlewareLoader({app: expressApp});
}