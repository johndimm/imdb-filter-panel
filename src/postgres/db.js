const { response } = require('express')
const { Client, Pool } = require('pg')
const pool = new Pool()

async function performSQLQuery(query) {
	console.log('===> performSQLQuery, query: ', query)

	try {
		const response = await pool.query(query)

		return response.rows
	} catch (error) {
		console.log('===> performSQLQuery, error:', error)
	}
}

exports.getMovies = function () {
	return performSQLQuery(
		`select * from movies order by imdbrating desc LIMIT 6000;`
	)
}

exports.getExamples = function () {
	return performSQLQuery(`select * from example;`)
}
