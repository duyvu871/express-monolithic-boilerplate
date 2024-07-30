import mongoose, { Schema, Document } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import { paginate, toJSON } from './plugins';
import { roles } from '@/configs/roles';
import { z } from 'zod';
import { PaginateOptions, PaginateResult } from './plugins/paginate.plugin';

interface BankingInfo {
	bank: string;
	accountNumber: string;
	accountName: string;
}

export interface IUserDocument extends Document<Schema.Types.ObjectId>, IUser, IUserMethods {
}

export interface IUser {
	username: string;
	email: string;
	phone?: string; // Make phone number optional
	password: string;
	isEmailVerified: boolean;
	avatar?: string; // Make avatar optional
	role: typeof roles[number]; // Use type from roles array
	balance?: number;  // Make balance optional
	id_index?: number; // Make id_index optional
	virtualVolume?: number; // Make virtualVolume optional
	address?: string; // Make address optional
	chatHistory: Schema.Types.ObjectId[];  // Assuming chat history stores object ids
	transactions: Schema.Types.ObjectId[]; // Assuming transactions store object ids
	actionHistory: Schema.Types.ObjectId[]; // Assuming action history stores object ids
	bankingInfo?: BankingInfo; // Make banking info optional
}

export interface IUserModel extends mongoose.Model<IUserDocument> {
	isEmailTaken(email: string, excludeUserId?: string): Promise<boolean>;
	paginate(
		query: Record<string, string>,
		options: PaginateOptions
	): Promise<PaginateResult<IUserDocument>>;
}

export interface IUserMethods {
	isPasswordMatch(password: string): Promise<boolean>;
}

// Separate interface for user input (without things like _id, createdAt etc.)
export interface IUserInputDTO {
	username: string;
	email: string;
	password: string;
	role: typeof roles[number];
}

// Zod schema for validating user input
export const userSchemaZod = z.object({
	username: z.string().min(1, 'Name is required').trim(),
	email: z.string().email('Invalid email').trim().toLowerCase(),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters'),
		// .regex(/\d/, 'Password must contain at least one number')
		// .regex(/[a-zA-Z]/, 'Password must contain at least one letter'),
	role: z.enum([roles[0], ...roles.slice(1)]),
});

const userSchema = new Schema<IUserDocument, IUserModel>(
	{
		username: { type: String, required: true, trim: true },
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
			validate(value: string) {
				if (!validator.isEmail(value)) {
					throw new Error('Invalid email');
				}
			},
		},
		// phone: {
		// 	type: String,
		// 	trim: true,
		// 	unique: true,
		// 	sparse: true, // Allows null values while maintaining uniqueness
		// 	validate(value: string) {
		// 		if (!validator.isMobilePhone(value)) {
		// 			throw new Error("Invalid phone number");
		// 		}
		// 	}
		// },
		password: {
			type: String,
			required: true,
			trim: true,
			minlength: 8,
			// validate(value: string) {
			// 	if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
			// 		throw new Error(
			// 			'Password must contain at least one letter and one number'
			// 		);
			// 	}
			// },
			private: true,
		},
		role: {
			type: String,
			enum: roles,
			default: 'user'
		},
		isEmailVerified: { type: Boolean, default: false },
		avatar: { type: String , default: ""}, // Make avatar optional
		balance: { type: Number, default: 0 },
		id_index: { type: Number , default: 0},
		virtualVolume: { type: Number , default: 0},
		address: { type: String , default: ""},
		chatHistory: [{ type: Schema.Types.ObjectId, ref: "Chat" }],
		transactions: [{ type: Schema.Types.ObjectId, ref: "Transaction" }],
		actionHistory: [{ type: Schema.Types.ObjectId, ref: "Action" }],
		bankingInfo: {
			type: {
				bank: { type: String },
        accountNumber: { type: String },
        accountName: { type: String },
      },
			default: {
				bank: "",
        accountNumber: "",
        accountName: "",
			},
		},
	},
	{
		timestamps: true,
		collection: 'users',
	}
);

// Plugins
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

// Statics (Custom static methods for the Model)
userSchema.statics.isEmailTaken = async function (email: string, excludeUserId?: string) {
	const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
	return !!user;
};

// Methods (Custom instance methods)
userSchema.methods.isPasswordMatch = async function (password: string): Promise<boolean> {
	const user = this as IUserDocument; // Typecasting to access 'password'
	return bcrypt.compare(password, user.password);
};

// Middleware (Pre-save hook)
userSchema.pre('save', async function (next) {
	const user = this as IUserDocument; // Typecasting to access 'password'
	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8);
	}
	next();
});


const User = mongoose.model<IUserDocument, IUserModel>('User', userSchema);

export default User;