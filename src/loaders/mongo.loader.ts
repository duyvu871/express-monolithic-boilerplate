import mongoose from "mongoose";
import env from "@/configs/env";

export class DataBaseService {
	public static instance: (typeof DataBaseService) | null = null;

	constructor() {
		this.connectDB(env.MONGODB_URI).then((res) => {
			console.log("UserDB is connected");
		}).catch((err) => {
			console.error("UserDB is not connected");
		})
	}

	async connectDB(databaseUrl: string): Promise<any> {
		try {
			//@ts-ignore
			if (1===1) {
				mongoose.set('debug', true);
				mongoose.set('debug', {color: true});
			}
			return await mongoose.connect(databaseUrl);
		} catch (error: any) {
			console.error(error.message);
			// process.exit(1);
			return null;
		}
	};

	static getInstance() {
		if (!DataBaseService.instance) {
			// @ts-ignore
			DataBaseService.instance = new DataBaseService() || null
		}
		return DataBaseService.instance;
	}
}

// const userDB = connectDB(DB_CONFIG.USER_DB_URL);
// const orderDB = connectDB(DB_CONFIG.ORDER_DB_URL);
// const rankingDB = connectDB(DB_CONFIG.RANKING_DB_URL);
const mongoLoader = async () => {
	// return new DataBaseService();
	return await mongoose.connect(`${env.MONGODB_URI}/${env.MONGODB_DB_NAME}`).then((res) => {
		console.log("UserDB is connected");
	}).catch((err) => {
		console.log(err.message)
		console.error("UserDB is not connected");
	});
};
export default mongoLoader;
