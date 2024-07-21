import { Router } from 'express';
import { validateBody, validateHeader, validateQuery } from '@/middlewares/validate';
import upload from '@/configs/upload';
import SpeechToTextController from '@/controllers/speech_to_text.controller';
import UserValidation from '@/validations/user.validation';
import { authenticate } from '@/middlewares/auth';
import S2TValidation from '@/validations/s2t.validation';

export const s2tRouter: Router = Router();
console.log('auth routing loaded: ', '/api/v1/s2t');

s2tRouter.route('/upload').post(
	validateHeader(UserValidation.getUserHeaders),
	authenticate,
	upload({mimetype: /^audio\//}).single('file'),
	SpeechToTextController.upload_file);

s2tRouter.route('/transcript/update').post(
	validateHeader(UserValidation.getUserHeaders),
	authenticate,
	validateBody(S2TValidation.updateTranscriptBody),
	SpeechToTextController.update_transcript);

s2tRouter.route('/transcript/get').get(
	validateHeader(UserValidation.getUserHeaders),
	authenticate,
	validateQuery(S2TValidation.getTranscriptQuery),
	SpeechToTextController.get_transcript);

s2tRouter.route('/transcript/list').get(
	validateHeader(UserValidation.getUserHeaders),
	authenticate,
	SpeechToTextController.list_transcript);
// s2tRouter.route('/job/:id').get(SpeechToTextController.get_job);
s2tRouter.route('/background_task_test').post(SpeechToTextController.background_task_test);
// s2tRouter.route('/get-transcript/:id').post(validateBody(AuthValidation.loginBody), AuthController.Login);
