import User from '@/models/user.model';
import UserService from '@/services/user.service';
import ApiError from '@/helpers/ApiError';
import { HttpStatusCode } from '@/helpers/http_status_code';
import Token from '@/models/token.model';
import tokens from '@/configs/tokens';
import TokenService from '@/services/token.service';


export default class AuthService {
	static async LoginWithEmailAndPassword(email: string, password: string) {
		const user = await UserService.getUserByEmail(email);
		if (!user) {
			throw new ApiError(HttpStatusCode.Unauthorized, 'incorrect email or password');
		}
		if (!await user.isPasswordMatch(password)) {
			throw new ApiError(HttpStatusCode.Unauthorized, 'incorrect email or password');
		}
		return user;
	}

	static async RegisterWithEmailAndPassword(doc: {email: string, password: string; name: string}) {
		const {email, password, name} = doc;
		if (await User.isEmailTaken(email)) {
			throw new ApiError(HttpStatusCode.BadRequest, 'Email is already taken');
		}
		return await UserService.createUser({email, password, name});
	}

	static async Logout(refreshToken: string) {
		const refreshTokenDoc = await Token.findOne({token: refreshToken, type: tokens.REFRESH, blacklisted: false});
		if (!refreshTokenDoc) {
			throw new ApiError(HttpStatusCode.NotFound, 'Not found');
		}
		await refreshTokenDoc.deleteOne({_id: refreshTokenDoc._id});
	}

	static async refreshAuth(refreshToken: string) {
		try {
			const refreshTokenDoc = await TokenService.verifyToken(refreshToken, tokens.REFRESH);
			const userId = (await UserService.getUserById(refreshTokenDoc.user))._id;
			if (!userId) {
				throw new ApiError(HttpStatusCode.Unauthorized, 'Unauthorized');
			}
			await TokenService.deleteToken(refreshToken);
			const accessToken = TokenService.generateAuthTokens(userId);
		} catch (error) {
			throw new ApiError(HttpStatusCode.Unauthorized, 'Unauthorized');
		}
	}

	static async verifyEmail(token: string) {
		const emailVerificationTokenDoc = await TokenService.verifyToken(token, tokens.VERIFY_EMAIL);
		const user = await UserService.getUserById(emailVerificationTokenDoc.user);
		if (!user) {
			throw new ApiError(HttpStatusCode.NotFound, 'User not found');
		}
		if (user.isEmailVerified) {
			throw new ApiError(HttpStatusCode.BadRequest, 'Email already verified');
		}
		const userId = user?._id;
		if (!userId) {
			throw new ApiError(HttpStatusCode.NotFound, 'User not found');
		}
		await UserService.updateUserById(userId.toString(), {isEmailVerified: true});
		await TokenService.deleteToken(token);
	}

	static async resetPassword(token: string, newPassword: string) {
		const resetPasswordTokenDoc = await TokenService.verifyToken(token, tokens.RESET_PASSWORD);
		const user = await UserService.getUserById(resetPasswordTokenDoc.user);
		if (!user) {
			throw new ApiError(HttpStatusCode.NotFound, 'User not found');
		}
		const userId = user?._id;
		if (!userId) {
			throw new ApiError(HttpStatusCode.NotFound, 'User not found');
		}
		await UserService.updateUserById(userId.toString(), {password: newPassword});
		await TokenService.deleteToken(token);
	}
}