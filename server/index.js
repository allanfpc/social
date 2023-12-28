import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoute from "./routes/auth.js";
import userRoute from "./routes/user.js";
import postsRoute from "./routes/posts.js";
import friendsRoute from "./routes/friend.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();
app.use(cookieParser());

const importedRoutes = [authRoute, userRoute, postsRoute, friendsRoute];

const routes = [];

importedRoutes.forEach(function (route) {
	// console.log(middleware.stack)
	const stack = route.stack;
	stack.forEach((middleware) => {
		// console.log(middleware);
		if (middleware.route) {
			// routes registered directly on the app
			routes.push(middleware.route.path);
		} else if (middleware.name === "router") {
			// router middleware
			middleware.handle.stack.forEach(function (handler) {
				route = handler.route;
				route && routes.push(route.path);
			});
		}
	});
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

const server = http.createServer(app);
const socket = new WebSocketServer({ server });

socket.on("connection", (socket, req) => {
	const url = new URL(req.url, `http://${req.headers.host}`);
	const params = url.searchParams;
	const senderUsername = params.get("senderUsername");
	const recipientUsername = params.get("recipientUsername");

	if (!connectedClients.has(senderUsername)) {
		const userId = crypto.randomUUID();
		socket.username = senderUsername;
		socket.userId = userId;
		connectedClients.set(senderUsername, socket);
	}

	let conversationId;

	conversations.forEach((conv, convId) => {
		const participants = conv.participants;
		if (
			participants &&
			participants.has(senderUsername) &&
			participants.has(recipientUsername)
		) {
			conversationId = convId;
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
				try {
					await createMessage(
						data.senderId,
						data.recipientId,
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
					conversation.messages.push({
						senderId: senderUsername,
						recipientId: recipientUsername,
						message: data.message
					});

					const castData = {
						event: "receive-message",
						senderId: senderUsername,
						recipientId: recipientUsername,
						message: data.message
					};
					broadcast(conversation, castData);
				}
				break;
			}
		}
	});
});

server.listen(8080, () => {
	console.log(`Server listen`);
});

export default app;
