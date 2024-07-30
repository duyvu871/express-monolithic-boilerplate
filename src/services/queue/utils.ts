export type WorkerJob = ExampleJob|ConvertToWavJob|SpeechToTextJob;
export type ExampleJob = {
	job_data: {
		magicNumber: number;
	}
	type: 'example_task';
};
export type ConvertToWavJob = {
	job_data: {
		id: string;
		file_name: string;
	}
	type: 'convert_to_wav';
};
export type SpeechToTextJob = {
	job_data: {
		id: string;
		file_name: string;
	}
	type: 'speech_to_text';
};
