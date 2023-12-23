import express from "express";
import multer from "multer";

import {
	updateUser,
	getUserBy,
	getMessagesBetweenUsers,
	createMessage
} from "../controllers/userController.js";
import { getUserPosts } from "../controllers/postsController.js";
import authValidation from "../middlewares/authValidation.js";
import { ApiError } from "../errors/error.js";

const router = express.Router();

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const type = req.query.type === "profile_img" ? "profile" : "cover";
		req.type = type;
		cb(null, `../social/uploads/${type}`);
	},
	filename: function (req, file, cb) {
		const customFileName = crypto.randomUUID();
		const fileExtension = file.originalname.split(".")[1];
		cb(null, customFileName + "." + fileExtension);
	}
});
const upload = multer({ storage }).single("file");

router.get("/users", async (req, res, next) => {
	console.log(req.query);
	const username = req.query.username;
	if (username) {
		try {
			const user = await getUserBy({ nickname: username });
			if (!user) {
				throw new ApiError("NOT_FOUND", 404, "Not Found", true);
			}

			res.status(200).json(user);
		} catch (error) {
			next(error);
		}
	}
});

router
	.route("/users/:userId")
	.all(authValidation())
	.get(getUserBy)
	.put(upload, updateUser)
	.delete();

router.get("/users/:userId/posts", authValidation(false), getUserPosts);

router.get("/users/:userId/friends", authValidation(), getUserPosts);

router
	.route("/users/:userId/messages")
	.get()
	.post(authValidation(), createMessage);

router.get(
	"/users/:senderId/messages/:recipientId",
	authValidation(),
	getMessagesBetweenUsers
);

export default router;
