import { z } from 'zod';
import { HttpStatusCode, HttpStatusMessage } from '@/helpers/http_status_code';

/**
 * Class representing an API error.
 *
 * @example
 * throw new ApiError(404, 'User not found');
 *
 * @param statusCode - HTTP Status code
 * @param message - Error message
 * @param isOperational - Whether the error is operational
 * @param stack - Error stack trace
 */
class ApiError extends Error {
    public statusCode: number;
    public isOperational: boolean;
    constructor(statusCode: number, message: string, isOperational = true, stack: string = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        } else {
            // error stack trace
            Error.captureStackTrace(this, this.constructor);
        }
    }

    static throw(statusCode: number, message: string) {
        throw new ApiError(statusCode, message);
    }
}

export class ZodErrorResponse {
    constructor(error: any) {
        if (error instanceof z.ZodError) {
            throw new ApiError(
              HttpStatusCode.BadRequest,
              error.errors.map((err) => err.message).join(', ')
            );
        } else {
            throw new ApiError(
              HttpStatusCode.InternalServerError,
              HttpStatusMessage.InternalServerError
            );
        }
    }
}

export default ApiError;