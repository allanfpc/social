import db from "../config/db.js";
import { ApiError } from "../errors/error.js";

async function getFriends(req, res, next) {
	const userId = req.user.id;

	const [query, place] = [
		`select
			f.id,
			f.action_user_id,
			f.status,
			u.name,
			u.nickname
		from
			friends as f
		left join
			users u ON u.id = (
				CASE
					WHEN f.user_id1 = ? THEN f.user_id2
					WHEN f.user_id2 = ? THEN f.user_id1
				END
			)
		where
			(f.user_id1 = ? OR f.user_id2 = ?) AND f.status = "accepted"`,
		[userId, userId, userId, userId]
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

async function getInvite(req, res, next) {
	const userId = req.user.id;
	const addedUserId = req.body.id;
	console.log(userId, addedUserId);

	const [query, place] = [
		"select id, user_id1, user_id2, action_user_id, status from friends where user_id1 IN(?, ?) AND user_id2 IN(?, ?)",
		[userId, addedUserId, userId, addedUserId]
	];

	try {
		const [rows] = await db.execute(query, place);
		if (rows.length === 0) {
			return res.status(204).end();
		}

		res.status(200).json(rows[0]);
	} catch (error) {
		next(error);
	}
}

async function createInvite(req, res, next) {
	const userId = req.user.id;
	const addedUserId = req.body.id;
	console.log(userId, addedUserId);

	const [query, place] = [
		"insert ignore into friends (user_id1, user_id2, action_user_id) values (?,?,?)",
		[userId, addedUserId, userId]
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

		res.status(201).json({ success: true });
	} catch (error) {
		next(error);
	}
}

async function updateInvite(req, res, next) {
	const userId = req.user.id;
	const addedUserId = req.body.user.id;
	const status = req.body.status;
	console.log("st: ", userId, addedUserId, status);
	const [query, place] = [
		"update friends set status = ? where action_user_id = ? and user_id2 = ?",
		[status, addedUserId, userId]
	];

	try {
		const [result] = await db.execute(query, place);
		console.log(result);
		if (!result.changedRows) {
			return res.status(204).end();
		}

		res.status(200).json({ success: true });
	} catch (error) {
		next(error);
	}
}

async function cancelInvite(req, res, next) {
	const userId = req.user.id;
	const addedUserId = req.body.id;

	const [query, place] = [
		"delete from friends where action_user_id = ? AND user_id2 = ?",
		[userId, addedUserId]
	];

	try {
		const [result] = await db.execute(query, place);
		if (!result.affectedRows) {
			return res.status(204).end();
		}

		res.status(200).json({ success: true });
	} catch (error) {
		next(error);
	}
}

export { createInvite, updateInvite, cancelInvite, getFriends, getInvite };
