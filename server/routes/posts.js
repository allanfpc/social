import express from "express";

import {
	getAllPosts,
	fetchPost,
	getComments,
	createPost,
	like,
	unlike,
	comment,
	share,
	deleteComment,
	deleteShare
} from "../controllers/postsController.js";
import authValidation from "../middlewares/authValidation.js";
import uploadFile from "../middlewares/uploadFile.js";

const router = express.Router();
router.use(express.json({ strict: true, type: "application/json" }));

router
	.route("/posts")
	.all(authValidation(false))
	.get(getAllPosts)
	.post(uploadFile, createPost)
	.delete();

router.route("/posts/:postId").get(authValidation(false), fetchPost).delete();

router
	.route("/posts/:postId/likes")
	.get(authValidation(false))
	.post(authValidation(), like)
	.put(authValidation(), unlike)
	.delete(authValidation(), deleteShare);

router
	.route("/posts/:postId/comments")
	.get(authValidation(false), getComments)
	.post(authValidation(), comment)
	.delete(authValidation(), deleteComment);

router
	.route("/posts/:postId/shares")
	.get(authValidation(false))
	.post(authValidation(), share)
	.delete(authValidation(), deleteShare);

export default router;
