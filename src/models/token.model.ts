import * as mongoose from "mongoose";
import { toJSON } from "@/models/plugins";
import Tokens from "@/configs/tokens";
import { z } from 'zod';

export interface IToken extends mongoose.Document {
    token: string;
    user: mongoose.Schema.Types.ObjectId;
    type: string;
    expires: Date;
    blacklisted: boolean;
}

export interface ITokenModel extends mongoose.Model<IToken> {

}

export interface ITokenDTO {
    token: string;
    user: mongoose.Schema.Types.ObjectId;
    type: string;
    expires: Date;
    blacklisted: boolean;
}

export const tokenSchemaZod = z.object({
    token: z.string().min(1, 'Token is required').trim(),
    user: z.string().min(1, 'User is required').trim(),
    type: z.string().min(1, 'Type is required').trim(),
    expires: z.date().min(new Date(), 'Expires must be greater than current date'),
    blacklisted: z.boolean().default(false),
});

const tokenSchema = new mongoose.Schema<IToken>({
    token: { type: String, required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true, enum: [Tokens.REFRESH, Tokens.RESET_PASSWORD, Tokens.VERIFY_EMAIL, Tokens.ACCESS]},
    expires: { type: Date, required: true },
    blacklisted: { type: Boolean, default: false}
}, {
    timestamps: true
});

tokenSchema.plugin(toJSON);

const Token = mongoose.model<IToken>('Token', tokenSchema);

export default Token;