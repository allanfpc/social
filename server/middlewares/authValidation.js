import jwt from "jsonwebtoken";
import { ApiError } from "../errors/error.js";

export default function authValidation(needAuth = true) {
	return (req, res, next) => {
		const token = req.cookies.token;

		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			if (needAuth && decoded.user.id === 0) {
				throw new ApiError("AUTH_ERROR", 401, "Unauthorized", true);
			}

			req.user = decoded.user;
			next();
		} catch (error) {
			if (error.name === "JsonWebTokenError") {
				next(new ApiError("AUTH_ERROR", 401, "Unauthorized", true));
			} else {
				next(error);
			}
		}
	};
}
