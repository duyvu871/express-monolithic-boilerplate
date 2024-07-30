import ApiError from '@/helpers/ApiError';
import { HttpStatusCode } from '@/helpers/http_status_code';
// import { roleRights } from '@/configs/roles';
// import { validateRole } from '@/helpers/validate_role';
import { NextFunction, Request, Response } from 'express';
import TokenService from '@/services/token.service';
import AsyncMiddleware from '@/helpers/waiter.helper';
import JwtService from '@/services/jwt.service';
import env from '@/configs/env';

export const authenticate = AsyncMiddleware.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const reqHeaderAuthToken = req.header('Authorization');
		if (!reqHeaderAuthToken) {
			ApiError.throw(HttpStatusCode.Unauthorized, 'Unauthorized - no token provided');
			return;
		}
		const token = reqHeaderAuthToken.replace('Bearer ', '');
		// logger.info(`Token: ${token}`);
		// verify token
		const tokenData = await TokenService.verifyToken(token, env.JWT_SECRET_KEY);
		// check if token is blacklisted
		if (tokenData.blacklisted) {
			ApiError.throw(HttpStatusCode.Unauthorized, 'Unauthorized - token blacklisted');
			return;
		}
		// check if token is expired
		if (tokenData.expires < new Date()) {
			ApiError.throw(HttpStatusCode.Unauthorized, 'Unauthorized - token expired');
			return;
		}
		// set token data to request
		// @ts-ignore
		req.token = tokenData.token;
		// @ts-ignore
		req.user = tokenData.user;
		next();
	} catch (error: any) {
		res.status(error.statusCode || 500).send({ message: error.message });
	}
});

export const authorize = (rights: string) => {
	return (req: Request & {token:string}, res: Response, next: NextFunction) => {
		let tokenDecode: any;
		if (!req.token) res.status(HttpStatusCode.Unauthorized).send({ message: 'Unauthorized - no token provided' });
		tokenDecode = JwtService.decode(req.token);
		if (!tokenDecode) res.status(HttpStatusCode.Unauthorized).send({ message: 'Unauthorized - invalid token' });
		const isContainRole = rights.includes(tokenDecode.role);
		if (!isContainRole) res.status(HttpStatusCode.Forbidden).send({ message: 'Forbidden' });
		next();
	};
}