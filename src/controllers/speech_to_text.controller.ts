import { Request, Response } from 'express';
import { response_header_template } from '@/helpers/response_header_template.helper';
import { HttpStatusCode } from '@/helpers/http_status_code';
import SpeechToTextService from '@/services/features/speech_to_text.service';
import BackgroundTaskService from '@/services/backgroud_task.service';
import AsyncMiddleware from '@/helpers/waiter.helper';
import { WorkerJob } from '@/services/queue/utils';
import AppConfig from '@/configs/app.config';
import path from 'path';
import S2TValidation from '@/validations/s2t.validation';
import { z } from 'zod';
import { ZodErrorResponse } from '@/helpers/ApiError';
import { deFlattenObject, flattenObject } from '@/utils/base';

export default class SpeechToTextController {
		public static upload_file = AsyncMiddleware.asyncHandler(async (req: Request, res: Response) => {
			try {
				const file = req.file as Express.Multer.File;
				const file_data = file.buffer //new Uint8Array(file.buffer);
				const file_name = file.originalname;
				// @ts-ignore
				const user = req.user as string;
				const db_repo = await SpeechToTextService.create_database_repo(file_name, user);
				const audit = await SpeechToTextService.create_audit(db_repo._id ?? 'error_audit_created');
				// const audio_file = await SpeechToTextService.create_audio_file(file_data, audit);
				const audio_file = await SpeechToTextService.create_audio_stream(req, audit);
				// console.log(audio_file);
				const convert_to_wav = await BackgroundTaskService.add_task<WorkerJob>(
					'background_task',
					'convert_to_wav',
					{
						type: 'convert_to_wav',
						job_data: {
							file_name: path.join(
								AppConfig.app_root,
								audit.audio.path,
							),
							id: String(db_repo._id)
						}
					});
				const get_transcript = await BackgroundTaskService.add_task(
					'background_task',
					'speech_to_text',
					{
						type: 'speech_to_text',
						job_data: {
							file_name: path.join(
								AppConfig.app_root,
								audit.audio.path//.replace('.mp3', '.wav')
							),
							id: String(db_repo._id)
						}
					});
				response_header_template(res).status(HttpStatusCode.Ok).send({id:db_repo._id ,file_name, audit, audio_file});
			} catch (error: any) {
				response_header_template(res).status(error.statusCode||HttpStatusCode.InternalServerError).send({message: error.message});
			}
		});

		public static get_transcript = AsyncMiddleware.asyncHandler(async (req: Request, res: Response) => {
			try {
				const transcript_id = req.query.id?.toString() as string;
				const audit = await SpeechToTextService.get_audit(transcript_id);
				const json_audit = audit.toJSON();
				response_header_template(res).status(HttpStatusCode.Ok).send({...json_audit});
			} catch (error: any) {
				response_header_template(res).status(error.statusCode||HttpStatusCode.InternalServerError).send({message: error.message});
			}
		});

		public static update_transcript = AsyncMiddleware.asyncHandler(async (req: Request, res: Response) => {
			try {
				const transcript = req.body as z.infer<typeof S2TValidation.updateTranscriptBody>;
				// console.log(transcript);
				// const reverse_flatten_object = deFlattenObject(transcript.data);
				// console.log(reverse_flatten_object);
				const transcript_id = transcript.id;
				// console.log(reverse_flatten_object.transcript);
				const parsed_transcript = S2TValidation.transcript.parse(deFlattenObject(transcript.data).transcript);
				const current_audit = await SpeechToTextService.get_audit(transcript_id);
				const json_audit = current_audit.toJSON();
				const flatten_audit_transcript = flattenObject({transcript: json_audit.transcript});
				// console.log(flatten_audit);
				const new_audit_transcript = deFlattenObject({...flatten_audit_transcript, ...transcript.data});
				// console.log(new_audit_transcript);
				const update_audit = await SpeechToTextService.update_audit(transcript_id, {...new_audit_transcript});
				response_header_template(res).status(HttpStatusCode.Ok).send({message: 'transcript updated'});
			} catch (error: any) {
				// new ZodErrorResponse(error);
				res.status(error.statusCode || HttpStatusCode.InternalServerError).send({message: error.message});
			}
		});

		public static list_transcript = AsyncMiddleware.asyncHandler(async (req: Request, res: Response) => {
			try {
				// @ts-ignore
				const user = req.user as string;
				const audit_list = await SpeechToTextService.list_transcript(user);
				response_header_template(res).status(HttpStatusCode.Ok).send({audit_list});
			} catch (error: any) {
				response_header_template(res).status(error.statusCode||HttpStatusCode.InternalServerError).send({message: error.message});
			}
		})

		public static background_task_test = AsyncMiddleware.asyncHandler(async (req: Request, res: Response) => {
			const magicNumber = parseInt(req.body.magicNumber.toString() as string);
			await BackgroundTaskService.add_task<WorkerJob>(
				'background_task',
				'example_task',
				{
					type: 'example_task',
					job_data: { magicNumber }
				});
			response_header_template(res).status(HttpStatusCode.Ok).send({message: 'background task added'});
		});
}