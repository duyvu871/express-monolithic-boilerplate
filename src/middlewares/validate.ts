import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodObject, ZodSchema } from 'zod';
import { HttpStatusCode } from '@/helpers/http_status_code';

type ValidateType = 'body' | 'headers' | 'query';

export const validate = (type: ValidateType, schema: ZodObject<any>) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const DTOToValidate = Object.keys(schema.shape).reduce((acc, key) => {
				if (req[type][key]) {
					acc[key] = req[type][key];
				}
				return acc;
			}, {} as Record<string, string | string[] | undefined>);

			schema.parse(DTOToValidate);

			next();
		} catch (error) {
			if (error instanceof ZodError) {
				const errorMessage = error.errors.map((err) => {
					const field = err.path[0];
					const message = schema.shape[field]?.invalid ? schema.shape[field]?.invalid(undefined) : err.message;
					return `${field}: ${message}`;
				}).join(', ');
				return res.status(HttpStatusCode.BadRequest).json({
					message: `${type} validation failed`,
					errors: errorMessage,
				});
			}
			return res.status(HttpStatusCode.InternalServerError).json({ message: 'Internal server error' });
		}
	};
};

export const validateBody = (schema: ZodObject<any>) => validate('body', schema);
export const validateHeader = (schema: ZodObject<any>) => validate('headers', schema);
export const validateQuery = (schema: ZodObject<any>) => validate('query', schema);

