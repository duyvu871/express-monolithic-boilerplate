import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { HttpStatusCode } from '@/helpers/http_status_code';

const validateBody = (schema: ZodSchema) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = schema.safeParse(req.body);

			if (result.success) {
				req.body = result.data;
				return next();
			} else {
				const errors = result.error.issues.map((issue) => ({
					path: issue.path.join('.'),
					message: issue.message,
				}));
				return res.status(400).json({
					message: 'Validation error',
					errors,
				});
			}
		} catch (error) {
			return next(error);
		}
	};
};

export default validateBody;