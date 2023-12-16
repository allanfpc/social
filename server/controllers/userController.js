import db from "../config/db.js";
import { ApiError } from "../errors/error.js";

async function getUserBy(arg) {
	console.log("getUserBy: ", arg);
	const nickname = arg?.nickname;
	const id = arg?.id;

	console.log(nickname, id);

	const [query, place] = [
		nickname
			? "select id, name, nickname, profile_img, cover, email from users where nickname = ?"
			: "select id, name, nickname, profile_img, cover, email from users where id = ?",
		[nickname || id]
	];

	try {
		const [rows] = await db.execute(query, place);
		console.log(rows);
		return rows[0];
	} catch (error) {
		throw new ApiError("INTERNAL_ERROR", 500, "Internal Server Error", false);
	}
}

async function updateUser(req, res, next) {
	const { id } = req.user;
	const img = req.file;
	const type = req.type === "profile" ? "profile_img" : "cover";
	const query = `update users set ${type} = ? where id = ?`;

	try {
		const [result] = await db.execute(query, [img.filename, id]);
		console.log(result);
		if (!result.affectedRows) {
			return res.status(204).end();
		}

		res.status(200).json({ success: true, filename: img.filename });
	} catch (error) {
		next(error);
	}
}

export { updateUser, getUserBy };
