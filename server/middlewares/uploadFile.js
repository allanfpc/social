import multer from "multer";
import { ApiError, UploadError } from "../errors/error.js";

const storage = multer.memoryStorage();
const diskStorage = multer.diskStorage({
	destination: "../social/uploads",
	filename: function (req, file, cb) {
		const randomId = crypto.randomUUID();
		const ext = file.mimetype.split("/")[1];

		file.randomId = randomId;
		file.ext = ext;

		cb(null, randomId + "-small." + ext);
	}
});

async function typeValidation(file) {
	const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

	if (!validTypes.includes(file.mimetype)) {
		return false;
	}

	return true;
}

let c = 0;

async function diskFileFilter(req, file, cb) {
	const validation = await typeValidation(file);
	const sizes = req.body.sizes;

	let validWidth;
	if (sizes) {
		const width = sizes[c].split(",");
		if (width) {
			validWidth = width < 300;
			c = c + 1;
		}
	}

	if (!validation || validWidth === false) {
		return cb(null, false);
	}

	return cb(null, true);
}

let i = 0;

async function memoryFileFilter(req, file, cb) {
	const validation = await typeValidation(file);

	const sizes = req.body.sizes;

	if (i === 0) {
		const fixedSizes = sizes.slice(0, sizes.length / 2);
		req.body.sizes = fixedSizes;
	}

	let validWidth;
	if (sizes) {
		const width = sizes[i].split(",");
		if (width) {
			validWidth = width > 300;
			i = i + 1;
		}
	}

	if (!validation || validWidth === false) {
		return cb(null, false);
	}

	file.resize = true;
	file.ext = file.mimetype.split("/")[1];
	file.randomId = crypto.randomUUID();

	return cb(null, true);
}

const uploadDisk = multer({
	storage: diskStorage,
	limits: {
		fileSize: 1000000
	},
	fileFilter: diskFileFilter
}).array("files");

const uploadMemory = multer({
	storage,
	limits: {
		fileSize: 1000000
	},
	fileFilter: memoryFileFilter
}).array("files");

async function uploadFile(req, res, next) {
	const promise = new Promise((resolve, reject) => {
		uploadMemory(req, res, function (err) {
			if (err) {
				reject(err);
			}
			c = 0;
		});

		uploadDisk(req, res, function (err) {
			if (err) {
				reject(err);
			}

			i = 0;
			resolve();
		});
	});

	try {
		await promise;

		const message = req.body.message;
		req.body.message = message.slice(0, message.length / 2)[0];

		next();
	} catch (err) {
		if (err instanceof multer.MulterError) {
			if (err.code === "LIMIT_FILE_SIZE" || err.code === "LIMIT_FILE_COUNT") {
				next(
					new UploadError(
						err.code,
						err.code === "LIMIT_FILE_SIZE" ? 413 : 422,
						err.message,
						true
					)
				);
			} else {
				next(new UploadError("BAD_REQUEST", 400, "Bad Request", true));
			}
		} else {
			next(new ApiError("INTERNAL_ERROR", 500, "Internal Server Error", false));
		}
	}
}

export default uploadFile;
