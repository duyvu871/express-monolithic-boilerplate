import * as mongoose from "mongoose";
import { toJSON } from "@/models/plugins";
import Tokens from "@/configs/tokens";

export interface IToken extends mongoose.Document {
    token: string;
    user: mongoose.Schema.Types.ObjectId;
    type: string;
    expires: Date;
    blacklisted: boolean;
}

const tokenSchema = new mongoose.Schema<IToken>({
    token: { type: String, required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true, enum: [Tokens.REFRESH, Tokens.RESET_PASSWORD, Tokens.VERIFY_EMAIL]},
    expires: { type: Date, required: true },
    blacklisted: { type: Boolean, default: false }
}, {
    timestamps: true
});

tokenSchema.plugin(toJSON);

const Token = mongoose.model<IToken>('Token', tokenSchema);

export default Token;