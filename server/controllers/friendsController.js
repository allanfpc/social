import db from "../config/db.js";
import { ApiError } from "../errors/error.js";

async function getFriends(req, res, next) {
	const userId = req.user.id;

	const [query, place] = [
		`select
			f.id,
			f.adding_user_id,
			f.added_user_id,
			f.status,			
			u.id as friend_id,
			u.name,
			u.nickname,
			u.status
		from
			friends as f
		left join
			users u ON u.id = (
				CASE
					WHEN f.adding_user_id = ? THEN f.added_user_id
					WHEN f.added_user_id = ? THEN f.adding_user_id
				END
			)
		where
			(f.adding_user_id = ? OR f.added_user_id = ?) AND f.status = "accepted"
		order by
			u.name asc`,
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
	const addedUserId = req.params.friendId;

	const [query, place] = [
		"select id, adding_user_id, added_user_id, status from friends where adding_user_id IN(?, ?) AND added_user_id IN(?, ?)",
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
	const addedUserId = req.params.friendId;

	const [query, place] = [
		"insert ignore into friends (adding_user_id, added_user_id) values (?,?)",
		[userId, addedUserId]
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
	const addedUserId = req.params.friendId;
	const status = req.body.status;

	const [query, place] = [
		"update friends set status = ? where adding_user_id = ? and added_user_id = ?",
		[status, addedUserId, userId]
	];

	try {
		const [result] = await db.execute(query, place);

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
	const friendId = req.params.friendId;

	const [query, place] = [
		"delete from friends where adding_user_id IN (?, ?) AND added_user_id IN (?,?)",
		[userId, friendId, friendId, userId]
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
