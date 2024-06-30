const handleHeavyTask = async () => {
	let time_start = new Date().getTime();
	// complete task after 20 seconds
	for (let index = 0; index <= 10_000_000_000; index++) {
		if (index == 10_000_000_000) {
			let time_end = new Date().getTime();
			console.log('Time completed: ', time_end - time_start, 'ms')
		}
	}
}

export default handleHeavyTask;