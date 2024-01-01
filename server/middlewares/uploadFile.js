import multer from "multer";
import { ApiError, UploadError } from "../errors/error.js";

const storage = multer.memoryStorage();

async function typeValidation(file) {
	const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

	if (!validTypes.includes(file.mimetype)) {
		return false;
	}

	return true;
}

async function fileFilter(req, file, cb) {
	const validation = await typeValidation(file);
	if (!validation) {
		return cb(null, false);
	}

	file.ext = file.mimetype.split("/")[1];
	file.randomId = crypto.randomUUID();

	return cb(null, true);
}

const uploadMemory = multer({
	storage,
	limits: {
		fileSize: 1000000
	},
	fileFilter
}).array("files");

async function uploadFile(req, res, next) {
	const promise = new Promise((resolve, reject) => {
		console.log(req.sizes);
		console.log(req.files);
		uploadMemory(req, res, function (err) {
			if (err) {
				reject(err);
			}
			resolve();
		});
	});

	try {
		await promise;
		next();
	} catch (err) {
		let error = err;
		if (err instanceof multer.MulterError) {
			if (err.code === "LIMIT_FILE_SIZE" || err.code === "LIMIT_FILE_COUNT") {
				error = new UploadError(
					err.code,
					err.code === "LIMIT_FILE_SIZE" ? 413 : 422,
					err.message,
					true
				);
			} else {
				error = new UploadError("BAD_REQUEST", 400, "Bad Request", true);
			}
		} else {
			error = new ApiError(
				"INTERNAL_ERROR",
				500,
				"Internal Server Error",
				false
			);
		}
		next(error);
	}
}

export default uploadFile;
