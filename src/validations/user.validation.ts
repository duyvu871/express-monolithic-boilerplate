import { z } from 'zod';

export default class UserValidation {
		// get user by id
		static getUserParams = z.object({
			uid: z.string().uuid(),
		});
		static getUserHeaders = z.object({
			authorization: z
				.string({
					required_error: 'Authorization header is required',
					invalid_type_error: 'Invalid authorization header',
				})
				.startsWith('Bearer ', 'Authorization header must start with "Bearer "'),
		});
		static createUserBody = z.object({
			name: z.string().min(1, 'Name is required').trim(),
			email: z.string().email('Invalid email').trim().toLowerCase(),
			password: z
				.string()
				.min(8, 'Password must be at least 8 characters')
				.regex(/\d/, 'Password must contain at least one number')
				.regex(/[a-zA-Z]/, 'Password must contain at least one letter'),
		});
}