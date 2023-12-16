import express from "express";
import jwt from "jsonwebtoken";

import {
	generateToken,
	login,
	register
} from "../controllers/authController.js";
import { getUserBy } from "../controllers/userController.js";

import { ApiError } from "../errors/error.js";

const router = express.Router();

// router.use(cors({
//     origin: "http://localhost:5173",
//     credentials: true,
// }))

router.use(express.json({ strict: true, type: "application/json" }));

router.get("/auth/user", async (req, res, next) => {
	try {
		const token = req.headers?.authorization?.split(" ")[1];

		if (token) {
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			if (decoded.user.id === 0) {
				return res.status(200).json({ guest: true });
			}

			const user = await getUserBy({ id: decoded.user.id });
			console.log("user: ", user);
			if (!user) {
				throw new ApiError(
					"INTERNAL_ERROR",
					500,
					"Internal Server Error",
					false
				);
			}
			res.status(200).json(user);
		} else {
			const guest = { name: "guest", id: 0, nickname: "guest" };

			const token = generateToken(guest);

			res.cookie("token", token, {
				maxAge: 60 * 60 * 1000,
				secure: true
			});

			res.status(200).json({ guest: true });
		}
	} catch (err) {
		console.log("err: ", err);
		next(err);
	}
});
router.post("/register", register);
router.post("/login", login);

export default router;
