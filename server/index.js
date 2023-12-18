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

console.log("hre");
console.log(routes);

app.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true,
		optionsSuccessStatus: 200
	})
);

app.use(authRoute);
app.use(userRoute);
app.use(postsRoute);
app.use(friendsRoute);

app.use(errorHandler);

app.listen(8080, () => {
	console.log(`Server listen`);
});

export default app;
