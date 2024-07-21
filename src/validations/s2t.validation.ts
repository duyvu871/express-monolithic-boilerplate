import { z } from 'zod';
import { Types } from 'mongoose';

export default class S2TValidation {
	public static transcript = z.array(z.object({
		start: z.number().optional(),
		end: z.number().optional(),
		speaker: z.string().optional(),
		text: z.string().optional(),
		confidence: z.number().optional(),
		words: z.array(z.object({
			start: z.number().optional(),
			end: z.number().optional(),
			text: z.string().optional(),
			confidence: z.number().optional(),
			speaker: z.string().optional(),
		})).optional(),
	}).strict());
	public static updateTranscriptBody = z.object({
			id: z.string().refine((id) => Types.ObjectId.isValid(id), { message: 'Invalid id' }),
			data: z.object({}).passthrough(), // accept any object
	});
	public static getTranscriptQuery = z.object({
		id: z.string().refine((id) => Types.ObjectId.isValid(id), { message: 'Invalid id' }),
	});
}