import { Request, Response } from 'express';
import AsyncMiddleware from '@/helpers/waiter.helper';
import AuthService from '@/services/auth.service';
import TokenService from '@/services/token.service';
import { response_header_template } from '@/helpers/response_header_template.helper';
import { ZodErrorResponse } from '@/helpers/ApiError';
import { HttpStatusCode } from '@/helpers/http_status_code';
import { Logger } from '@/logger/daily.log';

const logger =  new Logger('AuthController').getLogger();

export default class AuthController {
	static Login = AsyncMiddleware.asyncHandler(async (
		req: Request<{}, {}, {email: string, password: string}>,
		res: Response
	) => {
		try {
			const {email, password} = req.body ;
			const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress)?.toString();
			const user = await AuthService.LoginWithEmailAndPassword(email, password);
			const id = user?._id as unknown as string;
			if (!id) {
				throw new ZodErrorResponse('User not found');
			}
			const token = await TokenService.generateAuthTokens(id as string);
			response_header_template(res).status(200).send({user, token});
		} catch (error: any) {
			// logger.debug(error.message);
			console.log(error.message);
			response_header_template(res).status(error.statusCode||HttpStatusCode.InternalServerError).send({message: error.message});
		}
	});
	static Register = AsyncMiddleware.asyncHandler(async (
		req: Request<{}, {}, {email: string, password: string, username: string}>,
		res: Response
	) => {
		try {
			const {email, password, username} = req.body;
			// console.log({email, password, username});
			const user = await AuthService.RegisterWithEmailAndPassword({
				email, password, username
			});
			response_header_template(res).status(HttpStatusCode.Ok).send({user});
		} catch (error: any) {
			logger.debug(error.message);
			// new ZodErrorResponse(error);
			response_header_template(res).status(HttpStatusCode.InternalServerError).send({message: error.message});
		}
	});
}