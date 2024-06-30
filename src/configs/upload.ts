import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express'; // For custom file filtering

// Define interface for uploaded file
interface IUploadFile {
	[fieldname: string]: Express.Multer.File[];
}

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
		fileSize: 1024 * 1024 * 5, // 5MB file size limit
	},
	fileFilter: fileFilter, // Apply file type filter
});

export default upload;