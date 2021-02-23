import db from "../../../../../postgres/db";

export default async (req, res) => {
    const {
		query: { slug },
	} = req;

    const imdbid = slug[0] 
    const posterURL = slug[1]
    console.log('updatePoster, imdbid, posterURL')
    db.updatePoster(imdbid, posterURL)

	res.setHeader("Content-Type", "application/json");
	res.send({imdbid: imdbid, posterURL: posterURL});
};