import { Request, Response } from 'express';
import AsyncMiddleware from '@/helpers/waiter.helper';
import AuthService from '@/services/auth.service';
import TokenService from '@/services/token.service';
import { response_header_template } from '@/helpers/response_header_template.helper';
import { ZodErrorResponse } from '@/helpers/ApiError';
import { HttpStatusCode } from '@/helpers/http_status_code';


export default class AuthController {
	static Login = AsyncMiddleware.asyncHandler(async (
		req: Request<{}, {}, {email: string, password: string}>,
		res: Response
	) => {
		try {
			const {email, password} = req.body ;
			const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress)?.toString();
			const user = await AuthService.LoginWithEmailAndPassword(email, password);
			const token = await TokenService.generateAuthTokens(user._id as string);
			response_header_template(res).status(200).send({user, token});
		} catch (error: any) {
			response_header_template(res).status(error.statusCode||HttpStatusCode.InternalServerError).send({message: error.message});
		}
	});
	static Register = AsyncMiddleware.asyncHandler(async (
		req: Request<{}, {}, {email: string, password: string, name: string}>,
		res: Response
	) => {
		try {
			const {email, password, name} = req.body;
			const user = await AuthService.RegisterWithEmailAndPassword({
				email, password, name
			});
			response_header_template(res).status(HttpStatusCode.Ok).send({user});
		} catch (error: any) {
			// new ZodErrorResponse(error);
			response_header_template(res).status(HttpStatusCode.InternalServerError).send({message: error.message});
		}
	});
}