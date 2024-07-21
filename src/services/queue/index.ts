import { Queue } from 'bullmq';
import env from '@/configs/env';
import { WorkerJob } from '@/services/queue/utils';

const redisOptions = {
	host: env.REDIS_HOST,
	port: parseInt(env.REDIS_PORT),
};

const queues = {
	write_file: new Queue('write_file', {connection: redisOptions})
}

const addWriteFileTask = async (job: WorkerJob) => {
	await queues.write_file.add(job.type, job);
}

const addRetryableWriteFileTask = async (job: WorkerJob) => {
	// Retry the job 5 times with exponential backoff
	await queues.write_file.add(job.type, job, {
		attempts: 5,
		backoff: {
			type: 'exponential', // or 'fixed'
			delay: 2000 // 2, 4, 8, 16, 32 seconds
		}
	});
}