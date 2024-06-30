import { Request, Response } from 'express';

export default class SpeechToTextController {
		public static async upload_file(req: Request, res: Response) {
			try {
				const file = req.file as Express.Multer.File;
				const file_data = new Uint8Array(Buffer.from(file.buffer));

			} catch (error: any) {

			}
		}
}