import { z } from 'zod'

// Define the schema as an object with all of the env
// variables and their types
const envSchema = z.object({
	// jwt
	JWT_SECRET_KEY: z.string(),
	JWT_REFRESH_EXPIRATION: z.string(),
	JWT_EXPIRATION: z.string(),
	JWT_EMAIL_EXPIRATION: z.string(),
	JWT_PASSWORD_RESET_EXPIRATION: z.string(),
	PASSWORD_RESET_DELAY: z.string(),
	// mongodb
	MONGODB_URI: z.string().url(),
	MONGODB_DB_NAME: z.string().optional().default('Database'),
	// redis
	REDIS_SECRET_KEY: z.string(),
	REDIS_HOST: z.string(),
	REDIS_PORT: z.string(),
	REDIS_PASSWORD: z.string(),
	REDIS_USERNAME: z.string(),
	// app
	NODE_ENV: z
		.union([
			z.literal('development'),
			z.literal('testing'),
			z.literal('production'),
		])
		.default('development'),
	// ...
})

// Validate `process.env` against our schema
// and return the result
const env = envSchema.parse(process.env);

// Export the result so we can use it in the project
export default env;