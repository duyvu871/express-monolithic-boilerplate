import { HttpStatusCode } from '@/helpers/http_status_code';
import User, { IUser, userSchemaZod } from '@/models/user.model';
import ApiError, { ZodErrorResponse } from '@/helpers/ApiError';
import { PaginateResult } from '@/models/plugins/paginate.plugin';
import { Document, Query } from 'mongoose';

export default class UserService {
    /**
     * Create a new user
     * @param user - User object
     */
    public async createUser(user: Partial<IUser>) {
        const validate_request_body = userSchemaZod.parse(user);
        const isEmailExist = await User.isEmailTaken(validate_request_body.email);
        if (!isEmailExist) {
            throw new ApiError(HttpStatusCode.BadRequest, 'Email is already taken');
        }
        return await User.create(validate_request_body);
    }
    /**
     * Query for users
     * @param {Object} query - Mongo filter
     * @param {Object} options - Query options
     * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
     * @param {number} [options.limit] - Maximum number of results per page (default = 10)
     * @param {number} [options.page] - Current page (default = 1)
     * @returns {Promise<QueryResult>}
     */
    public async queryUser(
      query: Record<string, string>,
      options: Record<'sortBy'|'limit'|'page', string>
    ): Promise<PaginateResult<IUser>> {
        return await User.paginate(query, options);
    }

    /**
     * Get user by id
     * @param {string} userId - User Id
     * @returns {Promise<Query>}
     */
    public async getUserById(userId: string): Promise<Query<IUser, Document>>{
        const user = await User.findById(userId);
        if (!user) throw new ApiError(HttpStatusCode.NotFound, 'User not found');
        return user;
    }

    /**
     * Update user by id
     * @param {string} userId - User Id
     * @param email
     */
    public async getUserByEmail(email: string): Promise<NonNullable<Query<IUser, Document>>> {
        const user = await User.findOne({ email });
        if (!user) throw new ApiError(HttpStatusCode.NotFound, 'User not found');
        return user;
    }

    /**
     * Update user by id
     * @param {string} userId - User Id
     * @param {Object} updateBody - Update object
     * @returns {Promise<User>}
     */
    public async updateUserById(userId: string, updateBody: Partial<IUser>): Promise<IUser> {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(HttpStatusCode.NotFound, 'User not found');
        Object.assign(user, updateBody);
        await user.save();
        return user;
    }

    /**
     * Delete user by id
     * @param {string} userId - User Id
     * @returns {Promise<User>}
     */
    public async deleteUserById(userId: string): Promise<IUser | ZodErrorResponse> {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(HttpStatusCode.NotFound, 'User not found');
        await user.deleteOne();
        return user;
    }
}