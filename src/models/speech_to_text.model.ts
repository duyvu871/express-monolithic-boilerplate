import { Document, ObjectId, Schema } from 'mongoose';
import mongoose from 'mongoose';
import { toJSON } from '@/models/plugins';
import { TranscriptSentence } from 'assemblyai';

export interface IS2t extends mongoose.Document<string|ObjectId>, IS2tDTO {}

export interface IS2tModel extends mongoose.Model<IS2t, {}, IS2t> {}

export interface IS2tDTO {
	user: string|ObjectId;
	cloudPath: string;
	originName: string;
	path: string;
	auditPath: string;
	audio: {
		path: string;
		duration: number;
	}
	transcript: TranscriptSentence[];
	status: 'processing' | 'done' | 'error';
}

const S2tSchema = new Schema<IS2t>({
	user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	cloudPath: { type: String, default: "" },
	originName: { type: String, required: true},
	path: { type: String, default: "" },
	auditPath: { type: String, default: "" },
	audio: {
		path: { type: String, default: "" },
		duration: { type: Number, default: 0 },
	},
	transcript: [{
		start: { type: Number, default: 0 },
		end: { type: Number, default: 0 },
		speaker: { type: String, default: "" },
		text: { type: String, default: "" },
		words: [{
			start: { type: Number, default: 0 },
			end: { type: Number, default: 0 },
			text: { type: String, default: "" },
			confidence: { type: Number, default: 0 },
			speaker: { type: String, default: "" },
		}]
	}],
	status: { type: String, enum: ['processing', 'done', 'error'], default: "processing" }
}, {
	timestamps: true,
});

S2tSchema.plugin(toJSON);

S2tSchema.pre('save', function(next) {
	const s2t = this as IS2t;
	const id = s2t._id;
	const relativePath = `/storage/Assets/s2t/${id?.toString()}`
	s2t.path = relativePath;
	s2t.auditPath =  `${relativePath}/audit.json`;
	s2t.audio = {
		"path": `${relativePath}/audio.mp3`,
		"duration": 0
	};
	next();
});

const S2t = mongoose.model<IS2t, IS2tModel>('SpeechToText', S2tSchema);

export default S2t;
