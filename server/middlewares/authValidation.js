import jwt from "jsonwebtoken";
import { ApiError } from "../errors/error.js";

export default function authValidation(needAuth = true) {
	return (req, res, next) => {
		const token = req.headers?.authorization?.split(" ")[1];
		console.log(needAuth);
		console.log(token);
		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			console.log(decoded);
			if (needAuth && decoded.user.id === 0) {
				throw new ApiError("AUTH_ERROR", 401, "Unauthorized", true);
			}

			req.user = decoded.user;
			next();
		} catch (error) {
			console.log("err: ", error);
			next(error);
		}
	};
}
