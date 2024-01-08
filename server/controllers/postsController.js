import sharp from "sharp";

import db from "../config/db.js";

import { ApiError, UploadError } from "../errors/error.js";

// TIMELINE
// CLEAN CODE

// REUTILIZABLE FUNCTIONS ON BACKEND FOR RETURN ROWS ISOLATED...
// IMPROVE UPLOAD ERROR CLASS FOR FILE UPLOADS
// complete lazy loading component with isvisible
// implement page system where necessary (Timeline..., comments)

async function getAllPosts(req, res, next) {
	const { id } = req.user;
	const { page } = req.query;
	const limit = 20;
	const offset = page > 1 ? (page - 1) * limit : 0;

	const totalQuery = `select count(*) as total_posts from posts where posts.user_id != ?`;

	try {
		const [totalResult] = await db.query(totalQuery, [id]);
		const totalPosts = totalResult[0].total_posts;

		const [query, place] = [
			`
			SELECT 
				posts.*,
				u.id,
				u.name,
				u.nickname,
				u.profile_img,
				DATE_FORMAT(posts.created_at, '%m-%d-%Y') as date,				
				(select
					JSON_ARRAYAGG(JSON_OBJECT('img', img, 'post_id', post_id, 'id', id, 'img_id', img_id, 'ext', ext, 'responsive', responsive, 'sizes', CAST(sizes as JSON)))
				from
					posts_img			
				where
					posts.post_id = posts_img.post_id ) AS images,			
				(select count(comment) from comments where comments.post_id = posts.post_id) as total_comments, 
				(select count(message) from shares where shares.post_id = posts.post_id) as total_shares, 
				(select count(post_id) from likes where likes.post_id = posts.post_id AND likes.liked = 1) as total_likes,
				(select liked from likes where likes.user_id = ? AND liked = 1 AND posts.post_id = likes.post_id) as liked
			FROM 
				posts
			LEFT JOIN 
				users as u on user_id = u.id
			WHERE 
				posts.user_id != ?
			ORDER BY
				created_at desc
			LIMIT ? OFFSET ?;
		`,
			[id, id, limit, offset]
		];

		const [rows] = await db.query(query, place);

		if (rows.length === 0) {
			return res.status(204).end();
		}

		res.status(200).json({
			total_posts: totalPosts,
			rows
		});
	} catch (error) {
		next(error);
	}
}

async function getUserPosts(req, res, next) {
	console.log("getUserPosts");
	const { id } = req.user;
	const userId = req.params.userId;

	const [query, place] = [
		`
        SELECT 
            posts.*,
            u.id,
            u.name,
            u.nickname,
            u.profile_img,
            DATE_FORMAT(posts.created_at, '%m-%d-%Y') as date,
			(select 
				JSON_ARRAYAGG(JSON_OBJECT('img', img, 'post_id', post_id, 'id', id, 'img_id', img_id, 'ext', ext, 'responsive', responsive, 'sizes', CAST(sizes as JSON)))
			from
				posts_img
            where
				posts.post_id = posts_img.post_id ) AS images,
            (select count(comment) from comments where comments.post_id = posts.post_id) as total_comments, 
            (select count(message) from shares where shares.post_id = posts.post_id) as total_shares, 
            (select count(post_id) from likes where likes.post_id = posts.post_id AND likes.liked = 1) as total_likes,
            (select liked from likes where likes.user_id = ? AND liked = 1 AND posts.post_id = likes.post_id) as liked
        FROM
            posts
        LEFT JOIN 
            users as u on user_id = u.id        
        WHERE 
            posts.user_id = ?
        LIMIT 
            20 
        OFFSET 
            0;
    `,
		[id, userId]
	];

	try {
		const [rows] = await db.query(query, place);
		console.log(rows);
		if (rows.length === 0) {
			return res.status(204).end();
		}

		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
}

async function getPost(id, postId, next) {
	const [query, place] = [
		`
        SELECT 
            posts.*,
            u.id,
            u.name,
            u.nickname,
            u.profile_img,
            DATE_FORMAT(posts.created_at, '%m-%d-%Y') as date,
			(select 
				JSON_ARRAYAGG(JSON_OBJECT('img', img, 'post_id', post_id, 'id', id, 'img_id', img_id, 'ext', ext, 'responsive', responsive, 'sizes', CAST(sizes as JSON)))
			from
				posts_img
            where
				posts.post_id = posts_img.post_id ) AS images,
            (select count(comment) from comments where comments.post_id = posts.post_id) as total_comments, 
            (select count(message) from shares where shares.post_id = posts.post_id) as total_shares, 
            (select count(post_id) from likes where likes.post_id = posts.post_id AND likes.liked = 1) as total_likes,
            (select liked from likes where likes.user_id = ? AND liked = 1 AND posts.post_id = likes.post_id) as liked
        FROM 
            posts
        LEFT JOIN 
            users as u on user_id = u.id
        WHERE 
            posts.post_id = ?
        LIMIT 
            20 
        OFFSET 
            0;
    `,
		[id, postId]
	];
	try {
		const [row] = await db.query(query, place);

		return row;
	} catch (error) {
		next(error);
	}
}

async function fetchPost(req, res, next) {
	const { id } = req.user;
	const postId = req.params.postId;

	try {
		const data = await getPost(id, postId, next);

		if (!data) {
			throw new ApiError("NOT_FOUND", 404, "Specified post not found", true);
		}
		res.status(200).json(data);
	} catch (error) {
		next(error);
	}
}

async function createPost(req, res, next) {
	const { id } = req.user;
	const { message } = req.body;
	const postId = crypto.randomUUID();
	const files = req.files;

	const [query, place] = [
		`insert into posts (user_id, post_id, text) values (?, ?, ?)`,
		[id, postId, message]
	];

	try {
		const [result] = await db.execute(query, place);

		if (!result.insertId) {
			throw new ApiError(
				"UNPROCESSABLE_ENTITY",
				422,
				"Unable to process the request to create the post",
				false
			);
		}
		if (files.length > 0) {
			const response = await processFile(req, res, next, postId);

			if (response.error) {
				await deletePost(req, res, next, postId);

				throw new UploadError(
					"IMAGE_INSERTION_ERROR",
					422,
					"Error uploading some files",
					true,
					response.error
				);
			}
		}

		const data = await getPost(id, postId, next);

		res.status(201).json({ success: true, post: data });
	} catch (error) {
		next(error);
	}
}

async function deletePost(req, res, next, id) {
	const postId = id || req.params.postId;

	const [query, place] = [`delete from posts where post_id = ?`, [postId]];

	try {
		const [result] = await db.query(query, place);
		console.log(result);
		if (!result.affectedRows) {
			return res.status(204).end();
		}

		const success = { success: true };

		if (id) {
			return success;
		} else {
			res.status(201).json({ success: true });
		}
	} catch (error) {
		next(error);
	}
}

async function like(req, res, next) {
	const userId = req.user.id;
	const postId = req.params.postId;
	console.log("postId: ", postId);
	const [query, place] = [
		`insert into likes (user_id, post_id, liked) values (?, ?, ?) ON DUPLICATE KEY UPDATE liked = VALUES(liked)`,
		[userId, postId, 1]
	];

	try {
		const [result] = await db.query(query, place);

		if (!result.insertId) {
			return res.status(204).end();
		}
		res.status(201).json({ success: true, likeId: result.insertId });
	} catch (error) {
		next(error);
	}
}

async function unlike(req, res, next) {
	const userId = req.user.id;
	const postId = req.params.postId;
	console.log(userId, postId);
	const [query, place] = [
		`update likes set liked = 0 where user_id = ? AND post_id = ?`,
		[userId, postId]
	];

	try {
		const [result] = await db.query(query, place);
		console.log(result);
		if (!result.affectedRows) {
			return res.status(204).end();
		}
		res.status(200).json({ success: true });
	} catch (error) {
		next(error);
	}
}

async function getComments(req, res, next) {
	const postId = req.params.postId;

	const [query, place] = [
		`select 
			u.id, 
			u.name, 
			u.nickname, 
			u.profile_img, 
			comment, 
			user_id, 
			post_id,  
			DATE_FORMAT(comments.created_at, '%m-%d-%Y') as date 
		from 
			comments 
		left join 
			users as u on u.id = comments.user_id 
		where 
			post_id = ? 
		order by 
			created_at asc 
		limit 20 offset 0`,
		[postId]
	];

	try {
		const [rows] = await db.query(query, place);

		if (rows.length === 0) {
			return res.status(204).end();
		}

		res.status(201).json(rows);
	} catch (error) {
		next(error);
	}
}

async function comment(req, res, next) {
	const userId = req.user.id;
	const postId = req.params.postId;
	console.log("postID: ", postId, req.params.postId);
	const { comment } = req.body;

	const [query, place] = [
		`insert into comments(user_id, post_id, comment) values(?, ?, ?)`,
		[userId, postId, comment]
	];

	try {
		const [result] = await db.query(query, place);

		if (!result.insertId) {
			return res.status(204).end();
		}

		res.status(201).json({ success: true, commentId: result.insertId });
	} catch (error) {
		next(error);
	}
}

async function share(req, res) {
	const userId = req.user.id;
	const postId = req.params.postId;
	const { message } = req.body;

	const [query, place] = [
		`insert into shares(user_id, post_id, message) values(?, ?, ?)`,
		[userId, postId, message]
	];

	try {
		const [result] = await db.query(query, place);

		if (!result.insertId) {
			return res.status(204).end();
		}

		res.status(201).json({ success: true, shareId: result.insertId });
	} catch (error) {
		res.status(500).json({ error: "Internal server error" });
	}
}

async function deleteComment(req, res) {
	console.log("delete");
}

async function deleteShare(req, res) {
	console.log("delete share");
}

async function processFile(req, res, next, postId) {
	const files = req.files;
	const widths = req.body.sizes;

	const resizeFile = async (file, index) => {
		const width = parseInt(typeof widths === "string" ? widths : widths[index]);

		const sizes = {
			small: width < 300 ? width : 280
		};

		if (width > 680) {
			sizes.medium = 680;
		} else {
			if (sizes.small !== width) {
				sizes.medium = width;
			}
		}

		if (width > 1024) {
			sizes.large = 1024;
		} else {
			if (sizes.medium !== width && sizes.small !== width) {
				sizes.large = width;
			}
		}

		file.sizes = sizes;

		const promises = [];

		try {
			function checkImgAnimation(buffer) {
				const binaryString = String.fromCharCode.apply(
					this,
					new Uint8Array(buffer).slice(0, 100)
				);

				if (
					binaryString.indexOf("ANIM") !== -1 ||
					binaryString.indexOf("GIF89a") !== -1
				) {
					return true;
				}

				return false;
			}

			const anim = checkImgAnimation(file.buffer);

			for (const size in sizes) {
				promises.push(
					sharp(file.buffer, { animated: anim })
						.resize(sizes[size])
						.toFile(`../social/uploads/${file.randomId}-${size}.${file.ext}`)
				);
			}

			await Promise.all(promises);
		} catch (error) {
			next(
				new ApiError("IMAGE_RESIZE_ERROR", 500, "Error resizing image", false)
			);
		}
	};

	const resizePromises = [];

	try {
		for (const [index, file] of Object.entries(files)) {
			resizePromises.push(resizeFile(file, index));
		}
		await Promise.all(resizePromises);

		return await insertPostFiles(postId, files);
	} catch (error) {
		next(error);
	}
}

async function insertPostFiles(postId, files) {
	const errorFiles = [];

	const query = `insert into posts_img(img_id, post_id, img, ext, responsive, sizes) values(?, ?, ?, ?, ?, ?)`;

	for (const file of files) {
		const [result] = await db.query(query, [
			file.randomId,
			postId,
			file.randomId,
			file.ext,
			file.resize,
			JSON.stringify(file.sizes)
		]);

		if (!result.insertId) {
			errorFiles.push(file.originalname);
		}
	}

	if (errorFiles.length > 0) {
		return { error: errorFiles };
	}

	return { success: true };
}

export {
	getAllPosts,
	getUserPosts,
	fetchPost,
	getComments,
	createPost,
	like,
	unlike,
	comment,
	share,
	deleteComment,
	deleteShare
};
