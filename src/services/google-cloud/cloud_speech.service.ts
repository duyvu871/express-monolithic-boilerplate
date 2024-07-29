import speech, { SpeechClient } from '@google-cloud/speech';
import { getDownloadURL, getMetadata, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '@/configs/firebase';
import { Storage } from '@google-cloud/storage';
import { AssemblyAI, ParagraphsResponse, SentencesResponse, Transcript } from 'assemblyai';
import FileStorageService from '@/services/CURD/file_storage.service';

interface UploadFileProps {
	file: File|Uint8Array|Blob|Buffer;
	filePath: string; // The path in Firebase Storage (e.g., 'images/profile-pics/user123.jpg')
	onProgress?: (progress: number) => void; // Optional progress callback
}

interface UploadFileToGoogleCloudStorageProps {
	bucketName: string;
	specialPath: string;
	filePath: string; // The path in Firebase Storage (e.g., 'images/profile-pics/user123.jpg')
	fileName: string; // The name of the file (e.g., 'user123.jpg')
}

type GetTranscriptType = 'sentences' | 'subtitles' | 'paragraphs' | 'full';

interface TranscriptResponses {
	sentences: SentencesResponse;
	subtitles: string;
	paragraphs: ParagraphsResponse;
	full: Transcript;
}

export default class CloudSpeech {
	private static client: any;
	public static getInstance(): AssemblyAI {
		if (!CloudSpeech.client) {
			// this.client = new speech.SpeechClient({
			// 	keyFilename: './src/services/google-cloud/connected-brain-be2917cfac7e.json',
			// });
			this.client = new AssemblyAI({
				apiKey: "0bdf7fbca1fb45c785c95840da99147f"
			})
		}
		return this.client;
	}

	public static async recognizeAudio(audio: Uint8Array|string|Buffer): Promise<{transcriptId: string, text: string}> {
		console.log(audio);
		const client = this.getInstance();
		// const [operation] = await client.longRunningRecognize({
		// 	config: {
		// 		encoding: 'LINEAR16',
		// 		sampleRateHertz: 16000,
		// 		languageCode: 'en-US',
		// 		audioChannelCount: 1,
		// 		metadata: {
		// 			interactionType: 'DISCUSSION',
		// 			microphoneDistance: 'NEARFIELD',
		// 			originalMediaType: 'AUDIO',
		// 			recordingDeviceType: 'SMARTPHONE',
		// 			recordingDeviceName: 'Pixel 3a',
		// 			originalMimeType: 'audio/wav',
		// 		}
		// 	},
		// 	audio: {
		// 		// content: audio,
		// 		uri: audio.toString(),
		// 	},
		// });
		// console.log(operation.metadata);
		// const [response] = await operation.promise();
		// if (!response.results) return '';
		// const transcription = response.results
		// 	.map(result => result?.alternatives ? result.alternatives[0].transcript ?? null : '')
		// 	.join('\n');
		// console.log(`Transcription: ${transcription}`);
		// return transcription;

		const audioUrl = audio.toString();

		const config = {
			audio_url: audioUrl
		}
		const transcript = await client.transcripts.transcribe(config)
		// console.log(transcript.words);
		// await FileStorageService.create_directory('storage/Assets/s2t/1');
		// await FileStorageService.write_file('storage/Assets/s2t/1/transcript.json', Buffer.from(JSON.stringify(transcript.words)));
		// console.log(transcript.text)

		return {
			transcriptId: transcript.id,
			text: transcript?.text || '',
		};
	}

	public static async getTranscript(transcriptId: string, type?: GetTranscriptType): Promise<SentencesResponse | ParagraphsResponse | Transcript | string | null> {
		const client = this.getInstance();
		if (!transcriptId) return null;
		const transcriptService = client.transcripts;
		// switch to the appropriate transcription service
		switch (type) {
			case 'sentences':
				return await transcriptService.sentences(transcriptId);
			case 'subtitles':
				return await transcriptService.subtitles(transcriptId);
			case 'paragraphs':
				return await transcriptService.paragraphs(transcriptId);
			case 'full':
				return await transcriptService.get(transcriptId);
			case undefined:
				return await transcriptService.get(transcriptId);
			default:
				return null;
		}
	}

	public static async uploadFileToFirebaseStorage({file, filePath, onProgress = (progress) => {}, }: UploadFileProps)
		: Promise<
			{downloadURL: string; storageLocation: string}
			| null
		> {
		try {
			const storageRef = ref(storage, filePath);

			// Create an upload task
			const uploadTask = uploadBytesResumable(storageRef, file);

			// Optional: Track upload progress
			if (onProgress) {
				uploadTask.on('state_changed', (snapshot) => {
					const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
					onProgress(progress);
				});
			}

			// Wait for the upload to complete
			await uploadTask;
			console.log('File uploaded successfully!');

			// Get the download URL for the uploaded file
			const downloadURL = await getDownloadURL(storageRef);
			const metadata = (await getMetadata(storageRef));
			const bucket = metadata.bucket;
			const fullPath = metadata.fullPath;
			const storageLocation = `gs://${bucket}/${fullPath}`;
			return {
				downloadURL,
				storageLocation,
			};

		} catch (error) {
			console.error('Error uploading file:', error);
			return null;
		}
	};

	public static async uploadFileToGoogleCloudStorage (
		{bucketName, specialPath, filePath, fileName }: UploadFileToGoogleCloudStorageProps)
		: Promise<
			{downloadURL: string; storageLocation: string}
			| null
		> {
		try {
			const storage = new Storage({
				keyFilename: './services-config/connected-brain-c0fd067b322a.json',
			});
			const bucket = storage.bucket(bucketName);
			const destination = fileName ? `${specialPath}/${fileName}` : fileName;
			// Create an upload task
			const uploadTask = await bucket.upload(filePath, {
				destination,
				// Support for very large files
				gzip: true,
				metadata: {
					cacheControl: 'public, max-age=31536000',
					acl: [{ entity: 'allUsers', role: 'READER' }],
				},
			}).then((uploadTask) => {
				console.log('File uploaded successfully!');
				return uploadTask;
			});

			// Wait for the upload to complete
			const [fileUploadResponse] = uploadTask;
			const [metadata] = await fileUploadResponse.getMetadata();

			// Get the download URL for the uploaded file
			const downloadURL = metadata.mediaLink || '';
			const storageLocation = `gs://${bucket.name}/${destination}`;
			return {
				downloadURL,
				storageLocation,
			};

		} catch (error) {
			console.error('Error uploading file:', error);
			return null;
		}
	}
}
