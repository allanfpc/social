import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";

import authRoute from "./routes/auth.js";
import userRoute from "./routes/user.js";
import postsRoute from "./routes/posts.js";
import friendsRoute from "./routes/friend.js";
import errorHandler from "./middlewares/errorHandler.js";
import { createMessage } from "./controllers/userController.js";

const app = express();

app.use(cookieParser());

app.use(
	cors({
		origin:
			process.env.NODE_ENV === "development"
				? "http://localhost:5173"
				: ["http://localhost", "http://localhost:4173"],
		methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "HEAD", "OPTIONS"],
		allowedHeaders: ["Content-Type"],
		credentials: true,
		optionsSuccessStatus: 200
	})
);

app.use(authRoute);
app.use(userRoute);
app.use(postsRoute);
app.use(friendsRoute);
app.use(errorHandler);

const importedRoutes = [authRoute, userRoute, postsRoute, friendsRoute];

const routes = [];

importedRoutes.forEach(function (route) {
	const stack = route.stack;
	stack.forEach((middleware) => {
		if (middleware.route) {
			routes.push(middleware.route.path);
		} else if (middleware.name === "router") {
			middleware.handle.stack.forEach(function (handler) {
				route = handler.route;
				route && routes.push(route.path);
			});
		}
	});
});

const wss = new WebSocketServer({
	noServer: true
});

const connectedClients = new Map();
const conversations = new Map();

function broadcast(conversation, data) {
	conversation.participants.forEach((participantId) => {
		const participantConnection = connectedClients.get(participantId);
		if (participantConnection) {
			participantConnection.send(JSON.stringify(data));
		}
	});
}

wss.on("connection", async (socket, req, user) => {
	const url = new URL(req.url, `http://${req.headers.host}`);
	const params = url.searchParams;
	const senderUsername = params.get("senderUsername");
	const recipientUsername = params.get("recipientUsername");

	if (!connectedClients.has(senderUsername)) {
		const userId = crypto.randomUUID();
		socket.username = senderUsername;
		socket.userId = userId;
		socket.id = user.id;
		connectedClients.set(senderUsername, socket);
	}

	let conversationId;

	conversations.forEach((conv, convId) => {
		const participants = conv.participants;
		if (participants) {
			if (
				participants.has(senderUsername) &&
				participants.has(recipientUsername)
			) {
				conversationId = convId;
			}
		}
	});

	if (!conversationId) {
		const convId = crypto.randomUUID();
		const participants = new Set([senderUsername, recipientUsername]);

		conversations.set(convId, {
			participants,
			state: {
				[senderUsername]: { typing: false },
				[recipientUsername]: { typing: false }
			},
			messages: []
		});
		conversationId = convId;
	}

	const conversation = conversations.get(conversationId);
	if (conversation && conversation.participants.has(senderUsername)) {
		broadcast(conversation, {
			event: "receive-conversation",
			conversationId,
			state: conversation.state
		});
	}

	socket.on("error", onSocketError);

	socket.on("close", () => {
		conversations.forEach((conversation, conversationId) => {
			const participants = conversation.participants;
			if (participants && participants.has(socket.username)) {
				conversation.state[socket.username] = { typing: null };
				broadcast(conversation, {
					event: "receive-conversation",
					conversationId,
					state: conversation.state
				});
			}
		});

		connectedClients.delete(socket.username);
	});

	socket.on("message", async (m) => {
		const data = JSON.parse(m);
		switch (data.event) {
			case "change-state": {
				const conversation = conversations.get(data.conversationId);
				if (conversation && conversation.participants.has(senderUsername)) {
					conversation.state[senderUsername] = {
						...conversation.state[senderUsername],
						...data.state
					};

					const castData = {
						event: "change-state",
						state: conversation.state
					};
					broadcast(conversation, castData);
				}
				break;
			}

			case "send-message": {
				const recipientUser = await getUserBy(req, undefined, undefined, {
					nickname: recipientUsername
				});
				let insertId;
				try {
					insertId = await createMessage(
						user.id,
						recipientUser.id,
						data.message,
						req
					);
				} catch (error) {
					socket.close(
						1011,
						JSON.stringify({
							error: "Internal Server Error",
							code: 500
						})
					);
				}

				const conversation = conversations.get(data.conversationId);

				if (conversation && conversation.participants.has(senderUsername)) {
					const date = new Date();
					const dateNow = date.getHours() + ":" + date.getMinutes();

					conversation.messages.push({
						senderId: user.id,
						recipientId: recipientUser.id,
						id: insertId,
						message: data.message,
						date: dateNow
					});

					const castData = {
						event: "receive-message",
						id: insertId,
						senderId: user.id,
						recipientId: recipientUser.id,
						message: data.message,
						date: dateNow
					};
					broadcast(conversation, castData);
				}
				break;
			}
		}
	});
});

httpsServer.on("upgrade", function upgrade(request, socket, head) {
	socket.on("error", onSocketError);

	authValidation(true, request, function next(err) {
		const user = request.user;

		if (err || !user) {
			socket.write(
				"HTTP/1.1 401 Web Socket Protocol Handshake\r\n" +
					"Upgrade: WebSocket\r\n" +
					"Connection: Upgrade\r\n" +
					"\r\n"
			);
			socket.destroy();
			return;
		}

		socket.removeListener("error", onSocketError);
		wss.handleUpgrade(request, socket, head, function done(ws) {
			wss.emit("connection", ws, request, user);
		});
	});
});

function onSocketError(_, socket) {
	const errorMessage = JSON.stringify({
		type: "error",
		message: "WebSocket error occurred"
	});

	wss.clients.forEach((client) => {
		if (client === socket && client.readyState === 1) {
			client.send(errorMessage);
		}
	});

	socket.destroy();
}
});

export default app;
