import express from "express";

import {
	createInvite,
	updateInvite,
	cancelInvite,
	getFriends,
	getInvite
} from "../controllers/friendsController.js";
import authValidation from "../middlewares/authValidation.js";
import { getUserBy } from "../controllers/userController.js";

const router = express.Router();

router.get("/friends", authValidation(), getFriends);

router.get("/friends/:friendId", authValidation(), getUserBy);

router
	.route("/friends/:friendId/invites")
	.all(authValidation())
	.get(getInvite)
	.post(createInvite);

router
	.route("/friends/:friendId/invites/:inviteId")
	.all(authValidation())
	.get(getInvite)
	.put(updateInvite)
	.delete(cancelInvite);

export default router;
