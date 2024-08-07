import {Express} from 'express';
import ExpressLoader from "@/loaders/express.loader";
import MiddlewareLoader from "@/loaders/middleware.loader";
import mongoLoader from '@/loaders/mongo.loader';

export default async function createLoader({expressApp}: {expressApp: Express}) {
    await mongoLoader();
    ExpressLoader({app: expressApp});
    MiddlewareLoader({app: expressApp});
}