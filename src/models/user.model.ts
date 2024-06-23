import * as mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import { paginate, toJSON} from "@/models/plugins";
import {roles} from "@/configs/roles";
import {z} from "zod";

export interface IUser extends mongoose.Document {
    name: string;
    email: string;
    password: string;
    role: string;
    isEmailVerified: boolean;
}

export interface IUserInputDTO {
    name: string;
    email: string;
    password: string;
    role: string;
}

const userSchemaZod = z.object({
    name: z.string().min(1, 'Name is required').trim(),
    email: z.string().email('Invalid email').trim().toLowerCase(),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/\d/,'Password must contain at least one number')
        .regex(/[a-zA-Z]/, 'Password must contain at least one letter'),
    role: z.enum([roles[0], ...roles.slice(1)]),
})

const userSchema= new mongoose.Schema<IUser>({
    name: {type: String, required: true, trim: true},
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
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
        validate(value: string) {
            if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
                throw new Error('Password must contain at least one letter and one number');
            }
            // if (!validator.isStrongPassword(value)) {
            //     throw new Error('Password is too weak');
            // }
        },
        private: true // used by the toJSON plugin
    },
    role: {type: String, enum: roles, default: 'user'},
    isEmailVerified: {type: Boolean, default: false}
}, {
    timestamps: true
});

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

// check if email is unique
userSchema.statics.isEmailTaken = async function (email: string, excludeUserId: string) {
    // check if the email is taken by another user
    const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
    return !!user;
}

// check if password matches the user's password
userSchema.methods.isPasswordMatch = async function (password: string) {
    const user = this as IUser;
    return bcrypt.compare(password, user.password);
}


// hash the password before saving the user
userSchema.pre('save', async function (next) {
    const user = this as IUser;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

export interface IUserModel extends mongoose.Model<IUser> {
    isEmailTaken(email: string, excludeUserId: string): Promise<boolean>;
    paginate(query: Record<string, string>, options: Record<string, string>): Promise<any>;
}

/**
 * @typedef User
 */
const User = mongoose.model<IUser, IUserModel>('User', userSchema);

export default User;