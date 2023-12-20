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

app.listen(8080, () => {
	console.log(`Server listen`);
});

export default app;
