import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import db from "../config/db.js";
import { ApiError, ValidationError } from "../errors/error.js";

async function getUserBy(arg, getPass) {
	const [query, place] = [
		`select id, name, nickname, email, profile_img, ${
			getPass ? "password" : ""
		} from users where email = ?`,
		[arg]
	];

	try {
		const [rows] = await db.execute(query, place);
		console.log("rows: ", rows);
		return rows[0];
	} catch (error) {
		throw new ApiError("INTERNAL_ERROR", 500, "Internal Server Error", false);
	}
}

async function register(req, res, next) {
	const { name, nickname, email, password } = req.body;

	const query =
		"insert into users(name, nickname,email,password) values(?, ?, ?, ?)";

	try {
		const hashedPass = await bcrypt.hash(password, 10);

		const [result] = await db.execute(query, [
			name,
			nickname,
			email,
			hashedPass
		]);

		if (!result.insertId) {
			return res.status(404).json({ error: "Failed to register user" });
		}

		res.status(201).json({
			success: true,
			message: "User registered successfully",
			userId: result.insertId
		});
	} catch (error) {
		let exception = error;
		if (error.code === "ER_DUP_ENTRY") {
			exception = new ValidationError(
				"CONFLICT",
				409,
				"User with the provided email or nickname already exists",
				true
			);
		}

		next(exception);
	}
}

async function login(req, res, next) {
	const { email: inputEmail, password: inputPass } = req.body;

	try {
		const user = await getUserBy(inputEmail, true);

		if (!user) {
			return res.status(401).json({ error: "User not found" });
		}

		const { name, email, nickname, profile_img, id, password } = user;
		const validate = await bcrypt.compare(inputPass, password);

		if (!validate) {
			throw new ValidationError(
				"CREDENTIAL_INVALID",
				401,
				"Invalid Credentials",
				true
			);
		}

		const token = generateToken({ id, name, nickname, profile_img, email });

		res.cookie("token", token, {
			maxAge: 60 * 60 * 1000,
			httpOnly: true,
			secure: true,
			path: "/"
		});

		res.status(200).json({
			success: true,
			message: "Logged",
			token,
			user: { id, name, nickname, profile_img, email }
		});
	} catch (error) {
		next(error);
	}
}

async function signOut(req, res) {
	const token = req.cookies.token;

	if (token) {
		res.cookie("token", "", { maxAge: 0 });
	}

	res.status(200).json({ success: true });
}

const generateToken = (data) => {
	const token = jwt.sign(
		{
			user: {
				...data
			}
		},
		process.env.JWT_SECRET,
		{
			expiresIn: "1h"
		}
	);

	return token;
};

export { register, login, signOut, generateToken };
