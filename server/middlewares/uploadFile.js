import multer from "multer";
import { ApiError, UploadError } from "../errors/error.js";

const memoryStorage = multer.memoryStorage();

async function errorHandling(err) {
	let error;
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
		error = new ApiError("INTERNAL_ERROR", 500, "Internal Server Error", false);
	}
	return error;
}

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
	storage: memoryStorage,
	limits: {
		fileSize: 1000000
	},
	fileFilter
}).array("files");


async function uploadMemoryFile(req, res, next) {

	const promise = new Promise((resolve, reject) => {
		uploadMemory(req, res, function (err) {
			if (err) {
				reject(err);
			}
			resolve();
		});
	});

	try {
		await promise;
		if (callback) {
			callback();
		} else {
			next();
		}
	} catch (err) {
		const error = await errorHandling(err);
		next(error);
	}
}

const diskStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		const { type } = req.query;
		req.type = type;
		cb(null, `../social/uploads/${type}`);
	},
	filename: function (req, file, cb) {

		const randomId = req.query.randomId || crypto.randomUUID();
		const cropped = req.query.cropped ? "-cropped" : "";

		cb(null, randomId + cropped + "." + file.ext);
	}
});

const uploadDisk = multer({
	storage: diskStorage,
	limits: {
		fileSize: 1000000
	},
	fileFilter
}).single("file");


async function uploadDiskFile(req, res, next) {

	const promise = new Promise((resolve, reject) => {
		uploadDisk(req, res, function (err) {
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
		const error = await errorHandling(err);
		next(error);
	}
}

export const upload = { disk: uploadDiskFile, memory: uploadMemoryFile };
