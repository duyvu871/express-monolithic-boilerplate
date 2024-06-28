import jwt from 'jsonwebtoken';
import moment from 'moment';
import {HttpStatusCode, HttpStatusMessage} from '@/helpers/http_status_code';
import ApiError, {ZodErrorResponse} from '@/helpers/ApiError';
import Token, { ITokenDTO } from '@/models/token.model';
import tokenTypes from '@/configs/tokens';
import UserService from '@/services/user.service';
import AppConfig from '@/configs/app.config';
import env from '@/configs/env';

export default class TokenService {
		private userService: UserService;
		constructor() {
				this.userService = new UserService();
		}

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
		public generateToken(userId: string, expires: number, type: string, secret: string = AppConfig.app_secret): string {
			const payload = {
				userId,
				type,
				exp: moment().add(expires, 'minutes').unix(),
				iat: moment().unix(),
			};
			return jwt.sign(payload, secret);
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
	public async saveToken(token: string, userId: string, expires: number, type: string, blacklisted: boolean = false): Promise<ITokenDTO | ZodErrorResponse> {
		const tokenData = {
				token,
				user: userId,
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
	public async verifyToken(token: string, secret: string = AppConfig.app_secret): Promise<ITokenDTO> {
		const payload = jwt.verify(token, secret) as ITokenDTO;
		if (!payload) throw new ApiError(HttpStatusCode.Unauthorized, HttpStatusMessage.Unauthorized);
		const tokenDoc = await Token.findOne({ token, type: payload.type, user: payload.user});
		if (!tokenDoc) throw new ApiError(HttpStatusCode.NotFound, "Token not found");
		return tokenDoc;
	}

	/**
	 * Invalidate a token
	 * @param {string} token
	 * @returns {Promise<number>}
	 */
	public async invalidateToken(token: string): Promise<number> {
		return (await Token.updateOne({ token }, { blacklisted: true }).exec()).modifiedCount;
	}

	/**
	 * Delete a token
	 * @param {string} token
	 * @returns {Promise<number>}
	 */
	public async deleteToken(token: string): Promise<number> {
		return (await Token.deleteOne({ token }).exec()).deletedCount;
	}

	public async generateRefreshToken(userId: string): Promise<string> {
		const token = this.generateToken(userId, parseInt(env.JWT_REFRESH_EXPIRATION), tokenTypes.REFRESH ,env.JWT_SECRET_KEY);
		await this.saveToken(token, userId,parseInt(env.JWT_REFRESH_EXPIRATION), tokenTypes.REFRESH, false);
		return token;
	}

	public async generateAccessToken(userId: string): Promise<string> {
		return this.generateToken(userId, parseInt(env.JWT_EXPIRATION), tokenTypes.ACCESS, env.JWT_SECRET_KEY);
	}

	public async generateResetPasswordToken(email: string): Promise<string> {
		const user = (await this.userService.getUserByEmail(email));
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

	public async generateVerifyEmailToken(userId: string): Promise<string> {
		const token = this.generateToken(userId, parseInt(env.JWT_EMAIL_EXPIRATION), tokenTypes.VERIFY_EMAIL, env.JWT_SECRET_KEY);
		await this.saveToken(token, userId, parseInt(env.JWT_EMAIL_EXPIRATION), tokenTypes.VERIFY_EMAIL, false);
		return token;
	}

	public async generateAuthTokens(userId: string): Promise<{accessToken: string, refreshToken: string}> {
		const accessToken = await this.generateAccessToken(userId);
		const refreshToken = await this.generateRefreshToken(userId);
		return { accessToken, refreshToken };
	}
}