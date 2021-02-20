import db from '../../../postgres/db'

export default async (req, res) => {
	const movies = await db.getExamples()

	res.setHeader('Content-Type', 'application/json')
	res.send(movies)
}
