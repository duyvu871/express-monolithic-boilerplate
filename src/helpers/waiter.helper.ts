import {Request, Response, NextFunction} from "express";


class AsyncMiddleware {
    static async asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<Response>) {
        return (req: Request, res: Response, next: NextFunction) => {
            fn(req, res, next).catch(next);
        };
    }
}

export default AsyncMiddleware;