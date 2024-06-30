import {
	z
} from 'zod';
import * as process from 'node:process';

const parseErrorMessage = (message: string) => {

	return {
		errorMap: message.split(',').map((err) => {
			const [field, message] = err.split(':');
			return {
				field,
				message
			};
		}),
		invalid_type_error: 'Invalid type',
	}
}

// Define the schema as an object with all of the env
// variables and their types
const envSchema = z.object({
	// jwt
	JWT_SECRET_KEY: z.string(),
	JWT_REFRESH_EXPIRATION: z.string().refine((expiration) => parseInt(expiration) > 0, "Invalid expiration"),
	JWT_EXPIRATION: z.string().refine((expiration) => parseInt(expiration) > 0, "Invalid expiration"),
	JWT_EMAIL_EXPIRATION: z.string().refine((expiration) => parseInt(expiration) > 0, "Invalid expiration"),
	JWT_PASSWORD_RESET_EXPIRATION: z.string().refine((expiration) => parseInt(expiration) > 0, "Invalid expiration"),
	PASSWORD_RESET_DELAY: z.string().refine((delay) => parseInt(delay) > 0, "Invalid delay"),
	// mongodb
	MONGODB_URI: z.string().url(),
	MONGODB_DB_NAME: z.string().optional().default('Database'),
	// redis
	REDIS_SECRET_KEY: z.string(),
	REDIS_HOST: z.string(),
	REDIS_PORT: z.string().refine((port) => parseInt(port) > 0, "Invalid port number"),
	REDIS_PASSWORD: z.string(),
	REDIS_USERNAME: z.string(),
	// app
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	// ...
});

// Validate `process.env` against our schema
// and return the result
let env: z.infer<typeof envSchema>;

try {
	env = envSchema.parse(process.env);
} catch (error) {
	if (error instanceof z.ZodError) {

		console.log('Validation errors:');
		error.issues.forEach((issue) => {
			console.log(`- ${issue.path.join('.')}: ${issue.message}`);
		});
	} else {

		console.error('An error occurred:', error);
		process.exit(1);
	}
	env = process.env as any;
}

// Export the result so we can use it in the project
export default env;