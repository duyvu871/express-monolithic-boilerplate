import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

export default class FileStorageService {
	// handle file error
	public static handle_file_error(err: NodeJS.ErrnoException, file_name: string) {
		if (err.code === 'ENOENT') {
			console.error('No such file or directory:', file_name);
		} else if (err.code === 'EACCES') {
			console.error('Permission denied:', file_name);
		} else {
			console.error('Some other error occurred:', err.code);
		}
	}
	// file system callback
	public static file_system_callback(err: any, file_name: string, resolve: any, reject: any) {
		if (err) {
			this.handle_file_error(err, file_name);
			reject(false);
		} else {
			resolve(true);
		}

	}
	// create directory
	public static async create_directory(directory_name: string) {
		return await new Promise((resolve, reject) => {
			fs.mkdir(directory_name, {recursive: true}, (err) => {
				this.file_system_callback(err, directory_name, resolve, reject);
			});
		})
	}
	// write file
	public static async write_file(file_name: string, file_content: Buffer) {
		return await new Promise((resolve, reject) => {
			fs.writeFile(file_name, file_content, (err) => {
				this.file_system_callback(err, file_name, resolve, reject);
			});
		});
	}
	// append file
	public static async append_file(file_name: string, file_content: Buffer) {
		return await new Promise((resolve, reject) => {
			fs.appendFile(file_name, file_content, (err) => {
				this.file_system_callback(err, file_name, resolve, reject);
			});
		});
	}
	// read file
	public static read_file(file_name: string) {
		try {
			return fs.readFileSync(file_name, 'utf-8');
		} catch (error: any) {
			this.handle_file_error(error, file_name);
			return '';
		}
	}
	// delete file
	public static async delete_file(file_name: string) {
		return await new Promise((resolve, reject) => {
			fs.unlink(file_name, (err) => {
				this.file_system_callback(err, file_name, resolve, reject);
			});
		});
	}
	// convert to base64
	public static async convert_to_base64(file_name: string) {
		try {
			const data = fs.readFileSync(file_name);
			return data.toString('base64');
		} catch (error: any) {
			this.handle_file_error(error, file_name);
			return '';
		}
	}
	// convert to wav
	public static async convert_to_wav(file_name: string) {
			// logic here
	}
	// cut audio
	public static async cut_audio(file_name: string, start_time: number, duration: number) {
		const file = ffmpeg(file_name);
		const file_duration = await this.get_audio_duration(file_name) as number;
		const duration_time = start_time + duration;
		if (duration_time > file_duration) {
			throw new Error('Duration time is greater than file duration');
		}
		const output_file = file_name.replace('.mp3', `/_${start_time}_${duration}.mp3`);
		await new Promise((resolve, reject) => {
			file
				.setStartTime(start_time)
				.setDuration(duration)
				.output(output_file)
				.on('end', () => {
					resolve(true);
				}).on('error', (err) => {
					reject(err);
				}).run();
		});
	}
	// get audio duration
	public static async get_audio_duration(filePath: string) {
		return new Promise((resolve, reject) => {
			ffmpeg.ffprobe(filePath, (err, metadata) => {
				if (err) {
					reject(err);
				} else {
					resolve(metadata.format.duration);
				}
			});
		});
	}
}