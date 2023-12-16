import mysql from "mysql2";

const db = mysql.createConnection({
	host: "localhost",
	user: "allan",
	database: "social",
	password: "Floweroot"
});

export default db.promise();
