import jwt from 'jsonwebtoken';
import moment from 'moment';
import {HttpStatusCode, HttpStatusMessage} from '@/helpers/http_status_code';
import ApiError, {ZodErrorResponse} from '@/helpers/ApiError';
import Token, { ITokenDTO } from '@/models/token.model';
import tokenTypes from '@/configs/tokens';
import UserService from '@/services/user.service';
import AppConfig from '@/configs/app.config';
import env from '@/configs/env';
import { ObjectId } from 'mongoose';

export default class TokenService {
		/**
		 * Generate token
		 * @example
		 * const token = tokenService.generate('123456', 60, 'access');
		 * @param {string} userId
		 * @param {number} expires
		 * @param {string} type
		 * @param {string} [secret]
		 * @returns {string}
		 */
		static generateToken(userId: string| ObjectId, expires: number, type: string, secret: string = AppConfig.app_secret): string {
			const payloadData = {
				payload: {
					userId: userId.toString(),
					type,
				},
				// exp: moment().add(expires, 'minutes').unix(),
				iat: moment().unix(),
			};
			return jwt.sign(payloadData, secret, {expiresIn: expires, algorithm: 'HS256'});
		}

	/**
	 * Save a token
	 * @param {string} token
	 * @param {string} userId
	 * @param {number} expires
	 * @param {string} type
	 * @param {boolean} [blacklisted]
	 * @returns {Promise<IToken>}
	 */
	static async saveToken(token: string, userId: string|ObjectId, expires: number, type: string, blacklisted: boolean = false): Promise<ITokenDTO | ZodErrorResponse> {
		const tokenData = {
				token,
				user: userId.toString(),
				type,
				expires: moment().add(expires, 'minutes').toDate(),
				blacklisted,
		};
		return await Token.create(tokenData);
	}

	/**
	 * Verify token and return token data
	 * @param {string} token
	 * @param {string} [secret]
	 * @returns {Promise<IToken>}
	 */
	static async verifyToken(token: string, secret: string = AppConfig.app_secret): Promise<ITokenDTO> {
		const decodeJWT = jwt.decode(token) as { payload: { userId: string, type: string }, iat: number, exp: number };
		if (!(decodeJWT.exp && moment().isAfter(moment(decodeJWT.exp)))) {
			throw new ApiError(HttpStatusCode.Unauthorized, HttpStatusMessage.Unauthorized);
		}
		// const jwtVerified = jwt.verify(token, secret) as { payload: { userId: string, type: string }, iat: number, exp: number };
		// if (!jwtVerified) throw new ApiError(HttpStatusCode.Unauthorized, HttpStatusMessage.Unauthorized);
		const tokenDoc = await Token.findOne({ token, type: decodeJWT.payload.type, user: decodeJWT.payload.userId});
		if (!tokenDoc) throw new ApiError(HttpStatusCode.NotFound, "Token not found");
		return tokenDoc;
	}

	/**
	 * Invalidate a token
	 * @param {string} token
	 * @returns {Promise<number>}
	 */
	static async invalidateToken(token: string): Promise<number> {
		return (await Token.updateOne({ token }, { blacklisted: true }).exec()).modifiedCount;
	}

	/**
	 * Delete a token
	 * @param {string} token
	 * @returns {Promise<number>}
	 */
	static async deleteToken(token: string): Promise<number> {
		return (await Token.deleteOne({ token }).exec()).deletedCount;
	}

	static async generateRefreshToken(userId: string | ObjectId): Promise<string> {
		const token = this.generateToken(userId, parseInt(env.JWT_REFRESH_EXPIRATION), tokenTypes.REFRESH, env.JWT_SECRET_KEY);
		await this.saveToken(token, userId, parseInt(env.JWT_REFRESH_EXPIRATION), tokenTypes.REFRESH, false);
		return token;
	}

	static async generateAccessToken(userId: string | ObjectId): Promise<string> {
		const token = this.generateToken(userId, parseInt(env.JWT_EXPIRATION), tokenTypes.ACCESS, env.JWT_SECRET_KEY);
		await this.saveToken(token, userId, parseInt(env.JWT_EXPIRATION), tokenTypes.ACCESS, false);
		return token;
	}

	static async generateResetPasswordToken(email: string): Promise<string> {
		const user = (await UserService.getUserByEmail(email));
		const userId = (user?._id ?? '').toString();
		if (!userId) throw new ApiError(HttpStatusCode.NotFound, 'User not found');
		const latestToken = await Token.findOne({ user: userId, type: tokenTypes.RESET_PASSWORD}).sort({ createdAt: -1 }).limit(1).exec()
		if (latestToken && moment().isBefore(moment(latestToken.expires))) {
			throw new ApiError(HttpStatusCode.BadRequest, 'Password reset token already sent');
		}

		const isValidRequestSeparate = latestToken ? moment().isAfter(moment(latestToken.expires).add(parseInt(env.PASSWORD_RESET_DELAY), 'minutes')) : true;

		const token = this.generateToken(userId, parseInt(env.JWT_PASSWORD_RESET_EXPIRATION), tokenTypes.RESET_PASSWORD, env.JWT_SECRET_KEY);
		await this.saveToken(token, userId, parseInt(env.JWT_PASSWORD_RESET_EXPIRATION), tokenTypes.RESET_PASSWORD, false);
		return token;
	}

	static async generateVerifyEmailToken(userId: string): Promise<string> {
		const token = this.generateToken(userId, parseInt(env.JWT_EMAIL_EXPIRATION), tokenTypes.VERIFY_EMAIL, env.JWT_SECRET_KEY);
		await this.saveToken(token, userId, parseInt(env.JWT_EMAIL_EXPIRATION), tokenTypes.VERIFY_EMAIL, false);
		return token;
	}

	static async generateAuthTokens(userId: string | ObjectId): Promise<{accessToken: string, refreshToken: string}> {
		const accessToken = await this.generateAccessToken(userId);
		const refreshToken = await this.generateRefreshToken(userId);
		return { accessToken, refreshToken };
	}
}