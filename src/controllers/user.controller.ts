import AsyncMiddleware from '@/helpers/waiter.helper';
import User, { userSchemaZod } from '@/models/user.model';
import ApiError from '@/helpers/ApiError';
import { HttpStatusCode } from '@/helpers/http_status_code';
import { response_header_template } from '@/helpers/response_header_template.helper';
import { NextFunction, Request, Response } from 'express';
import zod, { z } from 'zod';
import {Logger} from '@/logger/daily.log';
import { Types } from 'mongoose';
import UserService from '@/services/user.service';

const logger = new Logger('UserController').getLogger();

export default class UserController {
	// get users with pagination and sorting
	static getUsers = AsyncMiddleware.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
		logger.info(`Get users request: ${req.query}`);

		const { page, limit, sortBy, populate } = req.query as { page: string, limit: string, sortBy: string, populate: string };
		// get users
		const users = await User.paginate({}, { page: String(page), limit: String(limit), sortBy, populate });
		response_header_template(res).status(HttpStatusCode.Ok).send({
			data: users
		});
	});

	//update user
	// static updateUser = AsyncMiddleware.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	// 	const updateUserReqZod = zod.object({
	// 		email: zod.string().email().optional(),
	// 		password: zod.string().min(6).optional(),
	// 		role: zod.string().optional(),
	// 		isEmailVerified: zod.boolean().optional(),
	// 	});
	// })

	// get user by id
	static getUserById = AsyncMiddleware.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
		const userId = req.params.id;
		// validate user id
		const userIdValidate = Types.ObjectId.isValid(userId);
		// check if user id is valid
		if (!userIdValidate) {
			throw new ApiError(HttpStatusCode.BadRequest, 'Invalid user id');
		}
		// get user by id
		const user = await UserService.getUserById(userId);

		response_header_template(res).status(HttpStatusCode.Ok).send({
			data: user
		});
	});
}