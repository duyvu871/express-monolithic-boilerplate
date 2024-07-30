import { Job } from 'bullmq';

export const handleHeavyTask = async ({magicNumber}:{magicNumber:number}) => {
	const n = magicNumber;
	let time_start = new Date().getTime();
	let time_completed = 0;
	console.log(magicNumber);
	// complete task after 20 seconds
	for (let index = 0; index <= n; index++) {

		if (index == n) {
			let time_end = new Date().getTime();
			console.log('Time completed:', time_end - time_start, 'ms');
			return 'DONE';
		}
	}

}
