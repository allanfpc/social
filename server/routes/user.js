import express from "express";
import multer from "multer";

import {
	updateUser,
	getUserBy,
	findUsers,
	createMessage,
	fetchMessagesBetweenUsers
} from "../controllers/userController.js";
import { getUserPosts } from "../controllers/postsController.js";
import authValidation from "../middlewares/authValidation.js";
import { ApiError } from "../errors/error.js";
import { upload } from "../middlewares/uploadFile.js";
import sharp from "sharp";

const router = express.Router();

router.post("/upload", authValidation(true), async (req, res, next) => {
	const { field, type, randomId } = req.query;
	const sizes = req.query.sizes?.split(",");
	const resizes = req.query.resize?.split(",");

	try {
		if (field === "files") {
			upload.memory(req, res, next, function () {
				for (const file of req.files) {
					for (const size of sizes) {
						sharp(file.buffer)
							.resize({ width: parseInt(size) })
							.toFile(
								`../social/uploads/${type}/${
									randomId || file.randomId
								}-${size}.${file.ext}`
							);
					}
				}

				res.status(207).json({
					success: true,
					randomId
				});
			});
		} else {
			upload.disk(req, res, next, function () {
				res.status(207).json({
					success: true,
					filename: randomId + "." + req.file.ext
				});
			});
		}
	} catch (error) {
		next(error);
	}
});

router.get("/users", async (req, res, next) => {
	const { username, search } = req.query;

	try {
		if (username) {
			const user = await getUserBy({ nickname: username });
			if (!user) {
				throw new ApiError("NOT_FOUND", 404, "Not Found", true);
			}

			res.status(200).json(user);
		}

		if (search) {
			const foundUsers = await findUsers(search);

			if (foundUsers.length === 0) {
				return res.status(204).end();
			}

			res.status(200).json(foundUsers);
		}
	} catch (error) {
		next(error);
	}
});

router
	.route("/users/:userId")
	.all(authValidation())
	.get(getUserBy)
	.put(updateUser)
	.delete();

router.get("/users/:userId/posts", authValidation(false), getUserPosts);

router.get("/users/:userId/friends", authValidation(), getUserPosts);

router.route("/users/:userId/messages").post(authValidation(), createMessage);

router.get(
	"/users/:senderId/messages/:recipientId",
	authValidation(),
	fetchMessagesBetweenUsers
);

export default router;
