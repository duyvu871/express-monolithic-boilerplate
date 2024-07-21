import multer, { DiskStorageOptions, FileFilterCallback } from 'multer';
import { Request } from 'express'; // For custom file filtering

// Set up storage options
const storage = multer.diskStorage({
	destination: (
		req: Request,
		file: Express.Multer.File,
		cb: (error: Error | null, destination: string) => void
	) => {
		// Specify where to store uploaded files (e.g., create 'uploads/' folder)
		cb(null, 'uploads/');
	},
	filename: (
		req: Request,
		file: Express.Multer.File,
		cb: (error: Error | null, filename: string) => void
	) => {
		// Customize filename generation
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(null, file.fieldname + '-' + uniqueSuffix + getExtension(file.originalname));
	},
});

// Function to get file extension
const getExtension = (filename: string): string => {
	const parts = filename.split('.');
	return parts.length > 1 ? `.${parts.pop()}` : '';
};

// Define file filter function
const fileFilter = (
	req: Request,
	file: Express.Multer.File,
	cb: FileFilterCallback
) => {
	// Check file type - allow only images
	if (
		file.mimetype.startsWith('image/') ||
		file.mimetype.startsWith('video/') ||
		file.mimetype.startsWith('audio/')) {
		cb(null, true);
	} else {
		cb(null, false); // Reject file
		cb(new Error('Invalid file type'));
	}
};

// Create the Multer middleware instance
const upload = multer({
	// storage: storage, // Use the configured storage
	limits: {
		fileSize: 1024 * 1024 * 100, // 100MB file size limit
	},
	fileFilter: fileFilter, // Apply file type filter
});

enum FilterMessage {
	mimetype = "Invalid mimeType",
	originalname = "Invalid original filename",
	encoding = "Invalid file encoding",
	size = "File size too large",
	destination = "Invalid file destination",
	path = "Invalid file path",
	filename = "Invalid filename defined"
}

const uploadMiddleware = (
	filter?: {
		mimetype?: RegExp;
		originalname?: RegExp;
		encoding?: RegExp;
		size?: RegExp;
		destination?: RegExp;
		path?: RegExp;
		filename?: RegExp;
	},
	optionLimit?: multer.Options['limits'],
	storageOptions?: Partial<DiskStorageOptions>
) => {
	const multerOption: multer.Options = {}
	if (optionLimit) multerOption.limits = optionLimit;
	if (storageOptions) multerOption.storage = multer.diskStorage(storageOptions);
	if (filter) multerOption.fileFilter = (
		req: Request,
		file: Express.Multer.File,
		cb: FileFilterCallback
	) => {
		// Check file type
		Object.keys(filter).forEach((key, index) => {
			const keyBinding = key as keyof typeof FilterMessage;
			const keyContent = file[keyBinding];
			if (keyContent && !filter[keyBinding]?.test(keyContent.toString())) {
				cb(null, false);
				cb(new Error(FilterMessage[keyBinding]));
			}
		});
		cb(null, true);
	};
	return multer(multerOption)
}

export default uploadMiddleware;