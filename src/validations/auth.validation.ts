import { z } from 'zod';

export default class AuthValidation {
	static registerBody = z.object({
		email: z.string().email('Invalid email').trim().toLowerCase(),
		password: z
			.string()
			.min(8, 'Password must be at least 8 characters'),
			// .regex(/\d/, 'Password must contain at least one number')
			// .regex(/[a-zA-Z]/, 'Password must contain at least one letter'),
		username: z.string().min(1, 'Name is required').trim(),
	});
	static loginBody = z.object({
		email: z.string().email('Invalid email').trim().toLowerCase(),
		password: z
			.string()
			.min(8, 'Password must be at least 8 characters')
			// .regex(/\d/, 'Password must contain at least one number')
			// .regex(/[a-zA-Z]/, 'Password must contain at least one letter'),
	});
}