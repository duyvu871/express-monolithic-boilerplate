import AsyncMiddleware from '@/helpers/waiter.helper';
import User, { userSchemaZod } from '@/models/user.model';
import ApiError from '@/helpers/ApiError';
import { HttpStatusCode } from '@/helpers/http_status_code';
import { response_header_template } from '@/helpers/response_header_template.helper';
import { NextFunction, Request, Response } from 'express';
import zod from 'zod';
import {Logger} from '@/logger/daily.log';
import { Types } from 'mongoose';

const logger = new Logger('UserController').getLogger();

export default class UserController {
	// create user
	static createUser = AsyncMiddleware.asyncHandler(async (req, res, next) => {
		// validate request body
		const validate_request_body = userSchemaZod.parse(req.body);
		// check if email is already taken
		const isEmailExist = await User.isEmailTaken(validate_request_body.email);
		if (!isEmailExist) {
			throw new ApiError(HttpStatusCode.BadRequest, 'Email is already taken');
		}
		// create user
		const createUser = await User.create(validate_request_body);
		if (!createUser) {
			throw new ApiError(HttpStatusCode.BadRequest, 'User not created');
		}

		logger.info(`Create user success: ${createUser._id} - ${createUser.email}`);

		response_header_template(res).status(HttpStatusCode.Created).send({
			data: createUser
		});
		return;
	});
	// get users with pagination and sorting
	static getUsers = AsyncMiddleware.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
		logger.info(`Get users request: ${req.query}`);
		// validate request query
		const getUsersReqZod = zod.object({
			page: zod.number().optional().default(1),
			limit: zod.number().optional().default(10),
			sortBy: zod.string().optional().default('createdAt:desc'),
			populate: zod.string().optional().default(''),
		});
		// parse request query
		const validate_request_query = getUsersReqZod.parse(req.query);
		const { page, limit, sortBy, populate } = validate_request_query;
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
		const user = await User.findById(userId);
		if (!user) {
			throw new ApiError(HttpStatusCode.NotFound, 'User not found');
		}
		response_header_template(res).status(HttpStatusCode.Ok).send({
			data: user
		});
	});
}