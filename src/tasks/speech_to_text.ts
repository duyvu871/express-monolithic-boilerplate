import { ConvertToWavJob } from '@/services/queue/utils';
import CloudSpeech from '@/services/google-cloud/cloud_speech.service';
import FileStorageService from '@/services/CURD/file_storage.service';
import SpeechToTextService from '@/services/features/speech_to_text.service';
import { SentencesResponse } from 'assemblyai';
import mongoLoader from '@/loaders/mongo.loader';


export default async function SpeechToText(data: ConvertToWavJob['job_data']) {
	try {
		await mongoLoader();
		const file_path = data.file_name;
		const file_content = FileStorageService.read_file(file_path);
		// const convert_buffer = Buffer.from(file_content, 'base64');
		const upload_to_google_cloud = await CloudSpeech.uploadFileToGoogleCloudStorage({
			bucketName: 'connected-brain-bucker',
			fileName: 'audio.mp3',
			specialPath: `storage/Assets/s2t/${data.id.toString()}`,
			filePath: file_path //`/storage/Assets/s2t/${data.id.toString()}/audio.mp3`,
		});
		// const upload_to_firebase = await CloudSpeech.uploadFileToFirebaseStorage({
		// 	file: convert_buffer,
		// 	filePath: file_path
		// });
		const transcripts = await CloudSpeech.recognizeAudio(
			upload_to_google_cloud?.downloadURL ?? ''
			// upload_to_firebase?.downloadURL ?? ''
		);
		// console.log('Transcript:', transcripts);
		const transcripts_parse = await CloudSpeech.getTranscript(transcripts.transcriptId, 'sentences') as SentencesResponse;
		if (!transcripts_parse) {
			throw new Error('Transcript not found');
		}
		// const audio_duration = await FileStorageService.get_audio_duration(file_path);
		// console.log('Audio Duration:', transcripts_parse.audio_duration);

		// console.log('Transcript:', transcripts_parse.sentences);

		await SpeechToTextService.update_audit(data.id, {
			cloudPath: upload_to_google_cloud?.storageLocation ?? '',
			// cloudPath: upload_to_firebase?.downloadURL ?? '',
			audio: {
				path: file_path,
				duration: transcripts_parse.audio_duration ?? 0,
			},
			transcript: transcripts_parse.sentences,
			status: 'done'
		});
		return 'DONE';
	}
	catch (error: any) {
		console.error(error);
		return 'ERROR';
	}
}