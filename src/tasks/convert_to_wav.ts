import FileStorageService from '@/services/CURD/file_storage.service';
import { ConvertToWavJob } from '@/services/queue/utils';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import S2t from '@/models/speech_to_text.model';
import { Types } from 'mongoose';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export async function ConvertToWavTask(data: ConvertToWavJob['job_data']){
	const convert_to_wav = await FileStorageService.convert_to_wav(data.file_name);
	const convert_to_flac = await FileStorageService.convert_to_flac(data.file_name);
	if (convert_to_wav && convert_to_flac) {
		return 'DONE';
	} else {
		const _id = new Types.ObjectId(data.id);
		const s2t_repo_update = await S2t.updateOne({_id}, {status: 'error'}).exec();
		const delete_upload_audio = await FileStorageService.delete_file(data.file_name);
		return 'ERROR';
	}
}