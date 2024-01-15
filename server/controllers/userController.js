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

async function findUsers(text) {
	const [query, place] = [
		"SELECT * FROM users WHERE nickname LIKE ? OR name LIKE ? LIMIT 20 OFFSET 0",
		[`%${text}%`, `%${text}%`]
	];

	try {
		const [rows] = await db.query(query, place);
		return rows;
async function blockUser(req, res, next) {
	const blockedUserId = req.params.userId;
	const { id } = req.user;

	const query = `insert ignore into blocks (blocking_user_id, blocked_user_id) values (?, ?)`;

	try {
		const [result] = await db.execute(query, [id, blockedUserId]);
		console.log(result);
		if (!result.affectedRows) {
			return res.status(204).end();
		}

		res.status(200).json({ success: true });
	} catch (error) {
		next(error);
	}
}

async function unblockUser(req, res, next) {
	const blockedUserId = req.params.userId;
	const { id } = req.user;

	const query = `delete from blocks where blocking_user_id = ? AND blocked_user_id = ?`;

	try {
		const [result] = await db.execute(query, [id, blockedUserId]);
		console.log(result);
		if (!result.affectedRows) {
			return res.status(204).end();
		}

		res.status(200).json({ success: true });
	} catch (error) {
		next(error);
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

async function createMessage(senderId, recipientId, message, req, res, next) {
	const [query, place] = [
		`insert into messages(send_user_id, receive_user_id, message) values(?, ?, ?)`,
		[senderId, recipientId, message]
	];

	const [result] = await db.execute(query, place);

	if (!result.insertId) {
		throw new ApiError(
			"UNPROCESSABLE_ENTITY",
			422,
			"Unable to process the request",
			false
		);
	}

	return true;
}

async function fetchMessagesBetweenUsers(req, res, next) {
	const senderId = req.user.id;
	const recipientId = req.params.recipientId;

	const messages = await getMessagesBetweenUsers(
		senderId,
		recipientId,
		req,
		res,
		next
	);
	res.status(200).json(messages);
}

export async function getMessagesBetweenUsers(
	senderId,
	recipientId,
	req,
	res,
	next
) {
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
		return rows;
	} catch (error) {
		next(error);
	}
}

export {
	getUserBy,
	updateUser,
	blockUser,
	unblockUser,
	updateUser,
	getUserBy,
	findUsers,
	createMessage,
	fetchMessagesBetweenUsers
};
