import db from "../../../postgres/db";

export default async (req, res) => {
	const movies = await db.getMovies();

	res.setHeader("Content-Type", "application/json");
	res.send(movies);
};