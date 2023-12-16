export default function errorHandler(err, req, res, next) {
	console.log("error Handler");
	console.log(err);
	const error = { error: err.httpCode ? err.message : "Internal Server Error" };

	if (err.fileNames) {
		error.files = err.fileNames;
	}

	res.status(err.httpCode || 500).json(error);
}
