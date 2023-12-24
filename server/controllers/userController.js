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

async function createMessage(req, res, next) {
	const id = req.user.id;
	const recipientId = req.body.recipientId;
	const message = req.body.message;

	const [query, place] = [
		`insert into messages(send_user_id, receive_user_id, message) values(?, ?, ?)`,
		[id, recipientId, message]
	];

	try {
		const [result] = await db.execute(query, place);

		if (!result.insertId) {
			throw new ApiError(
				"UNPROCESSABLE_ENTITY",
				422,
				"Unable to process the request",
				false
			);
		}

		res.status(201).json({
			success: true,
			insertId: result.insertId
		});
	} catch (error) {
		next(error);
	}
}

async function getMessagesBetweenUsers(req, res, next) {
	const senderId = req.user.id;
	const recipientId = req.params.recipientId;

	const [query, place] = [
		`select 
			id, 
			send_user_id, 
			receive_user_id, 
			message, 
			DATE_FORMAT(created_at, '%k:%i') as date
		from 
			messages 
		where 
			send_user_id = ? AND receive_user_id = ? OR send_user_id = ? AND receive_user_id = ?
		order by
			created_at desc
		limit 20 offset 0`,
		[senderId, recipientId, recipientId, senderId]
	];

	try {
		const [rows] = await db.execute(query, place);
		if (rows.length === 0) {
			return res.status(204).end();
		}
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
}

export { updateUser, getUserBy, createMessage, getMessagesBetweenUsers };
