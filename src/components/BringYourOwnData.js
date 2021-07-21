import React, { useEffect, useState } from 'react'
import FilterPanel from './FilterPanel'
import styles from './Movies.module.css'
import Head from 'next/head'
// import { delBasePath } from 'next/dist/next-server/lib/router/router'
// import csv from 'csvtojson'
import * as csv from 'csv-string'

// import csv from 'fast-csv'
import next from 'next'
import Papa from 'papaparse'

const MOVIES_PER_PAGE = 30

const allKeys = (movie, fieldStats, setQuery) => {
	const keyValPairs = Object.keys(movie).map((s, idx) => {
		const stats = fieldStats[s]
		if (stats.isUrl) return null

		const name = s.charAt(0).toUpperCase() + s.slice(1)

		console.log('OneMovie, name:', name)
		const list = movie[s]
		console.log('list:', list)
		const parts = typeof list === 'string' ? list.split(',') : []

		const hotDetail = parts.map((val, idx2) => {
			const comma = idx2 > 0 ? ',' : ''
			let v = val
			const parens = val.indexOf('(')
			if (parens != -1) v = val.substring(0, parens)

			return (
				<span key={idx * 100 + idx2} onClick={(e) => setQuery(v)}>
					{comma} {val}
				</span>
			)
		})

		return (
			<div key={idx}>
				<b>{name}:</b> {hotDetail}
			</div>
		)
	})
	return keyValPairs
}

const OneMovie = ({ movie, setOneMovie, setQuery, fieldStats }) => {
	const detail = allKeys(movie, fieldStats, setQuery)

	const posterField = fieldStats.cardFields.poster
	const poster = movie[posterField]

	return (
		<div className={styles.popup_background} onClick={(e) => setOneMovie(null)}>
			<div className={styles.one_movie}>
				<img src={poster} onError={(e) => onError(e, movie)} />
				<div className={styles.movie_details}>{detail}</div>
			</div>
		</div>
	)
}

const onLoad = (e) => {
	// Turn the display back on, in case it was previously
	// and erroneously turned off by onError.
	e.currentTarget.style.display = 'inline-block'
	e.preventDefault()
}

const updatePoster = async (movie, posterURL) => {
	console.log('updatePoster', movie, posterURL)
	if (movie.imdbid == null || posterURL == null) return

	const url = `/api/movies/poster/update/${movie.imdbid}/${encodeURIComponent(posterURL)}`
	const response = await fetch(url)
	const data = await response.json()
	console.log('updated the poster', data.imdbid, data.posterURL)
}

const fetchOMDBPoster = async (e, movie) => {
	console.log('Bad poster for ', movie)
	const url = `http://www.omdbapi.com/?i=${movie.imdbid}&apikey=985c8d27`
	const response = await fetch(url)
	const data = await response.json()
	updatePoster(movie, data.Poster)

	// Set the source of the current movie poster that generated the request.
	e.target.src = data.Poster
}

const onError = (e, movie) => {
	// Turn display off, because this may be a bad image link.
	// But it could also something innocuous that actually
	// doesn't prevent the image from displaying.
	e.currentTarget.style.display = 'none'

	fetchOMDBPoster(e, movie)

	e.preventDefault()
	e.target.onerror = null
}

const Card = ({ movie, onClick, cardFields, fieldStats, setQuery }) => {
	const title = movie[cardFields['title']]
	const plot = movie[cardFields['plot']]
	const poster = movie[cardFields['poster']]

	const detail = allKeys(movie, fieldStats, setQuery)

	// console.log('title, plot, poster', title, plot, poster)

	//			<div className={styles.movie_title}>{title}</div>
	//		<div className={styles.movie_plot}>{plot}</div>

	return (
		<div className={styles.movie_card} onClick={onClick} title={title}>
			<div>
				<img src={poster} onError={(e) => onError(e, movie)} onLoad={onLoad} />
				{detail}
			</div>
		</div>
	)
}

const Cards = ({ filteredData, setOneMovie, start, end, cardFields, fieldStats, setQuery }) => {
	return (
		<div>
			{filteredData
				.filter((val, idx) => idx < end)
				.map((val, idx) => {
					return (
						<Card
							movie={val}
							key={idx}
							onClick={(e) => setOneMovie(val)}
							cardFields={cardFields}
							fieldStats={fieldStats}
							setQuery={setQuery}
						/>
					)
				})}
		</div>
	)
}

const Row = ({ val2, idx2, counts }) => {
	const columns = Object.keys(val2)
		.sort((a, b) => counts[b] - counts[a])
		.filter((val, idx) => idx < 6)
		.map((fieldName, idx3) => {
			const v = val2[fieldName]
			let rowValue = v
			if (v.match(/^https?:\/\//)) {
				if (v.indexOf('image') != -1) {
					rowValue = <img src={v} />
				} else {
					rowValue = <a href={v}>link</a>
				}
			}
			// rowValue = <a href={rowValue}>link</a>
			return (
				<td key={idx3} onClick={(e) => setOneMovie(val2)}>
					{rowValue}
				</td>
			)
		})

	return <tr key={idx2}>{columns}</tr>
}

const Rows = ({ filteredData, counts, start, end }) => {
	const body = filteredData
		.filter((_, idx) => idx > 0 && idx >= start && idx < end)
		.map((val2, idx2) => {
			return <Row val2={val2} idx2={idx2} counts={counts} />
		})

	const header =
		filteredData.length === 0
			? []
			: Object.keys(filteredData[0])
					.sort((a, b) => counts[b] - counts[a])
					.filter((val, idx) => idx < 6)
					.map((fieldName, idx) => <th key={idx}>{fieldName}</th>)

	return (
		<table>
			<thead>{header}</thead>
			<tbody>{body}</tbody>
		</table>
	)
}

const scanCSVData = (jsonArray) => {
	const fields = Object.keys(jsonArray[0])
	let fieldStats = {}
	let posterField = ''

	// Scan.
	fields.forEach((fieldName) => {
		fieldStats[fieldName] = {}
		let distinct = {}

		let longest = ''
		let spaces = 0
		let commas = 0
		let isUrl = false
		let isImage = false
		let hasWordChar = false
		let isObject = false
		jsonArray.forEach((jsonRow) => {
			const type = typeof jsonRow[fieldName]
			// console.log('type', fieldName, type)
			if (type === 'object') return

			const cell = jsonRow[fieldName]

			commas += cell.split(',').length - 1
			spaces += cell.split(' ').length - 1

			let vals = [cell]
			if (spaces - commas < 10) vals = cell.split(', ')

			vals.forEach((v, idx) => {
				const val = v.replace(/^["']+/g, '').replace(/["']+$/, '')
				if (val in distinct) distinct[val] += 1
				else distinct[val] = 1

				if (val.length > longest.length) longest = val

				const s = val.split(' ').length - 1

				if (!isUrl && s === 0) {
					if (val.indexOf('http') != -1) isUrl = true
				}

				if (!isImage && isUrl && s === 0) {
					const re = /\.(jpg|jpeg|JPG|JPEG)["']?$/
					isImage = val.match(re) != null
				}

				if (!hasWordChar && val !== 'N/A') hasWordChar = val.match(/[a-zA-Z]/) != null

				if (!isObject) isObject = typeof val === 'object'
			})
		})

		if (posterField === '' && isImage) posterField = fieldName

		fieldStats[fieldName] = {
			longest: longest,
			count: Object.keys(distinct).length,
			// distinct: distinct,
			avgSpaces: spaces / jsonArray.length,
			isUrl: isUrl,
			isImage: isImage,
			avgCommas: commas / jsonArray.length,
			hasWordChar: hasWordChar,
			isObject: isObject
		}
	})

	const titleField = Object.keys(fieldStats)
		.filter(
			(fieldName) =>
				fieldStats[fieldName].hasWordChar &&
				fieldStats[fieldName].avgSpaces > 0 &&
				fieldStats[fieldName].longest.length < 100
		)
		.sort(
			(a, b) =>
				1000 * (fieldStats[b].count - fieldStats[a].count) +
				(fieldStats[a].longest.length - fieldStats[b].longest.length)
		)
		.find((a) => a)

	const plotField = Object.keys(fieldStats)
		.filter((fieldName) => fieldStats[fieldName].hasWordChar && fieldStats[fieldName].avgSpaces > 0)
		.sort(
			(a, b) =>
				1000 * (fieldStats[b].count - fieldStats[a].count) +
				(fieldStats[b].longest.length - fieldStats[a].longest.length)
		)
		.find((a) => a)

	console.log('plotField:', plotField)

	// Pick these using stats, hardcoded to movies.
	fieldStats['cardFields'] = {
		poster: posterField,
		title: titleField,
		plot: plotField
	}

	console.log('scan', fieldStats)
	return fieldStats
}

const pickFields = (jsonArray, fieldStats) => {
	// Choose the filter fields in order.
	let ff = []
	let sf = []

	Object.keys(fieldStats)
		.sort((a, b) => {
			const wa = fieldStats[a].hasWordChar ? -1000 : 1000
			const wb = fieldStats[b].hasWordChar ? -1000 : 1000
			const d = wa - wb + fieldStats[a].count - fieldStats[b].count
			return d
		})
		.filter(
			(a) =>
				//	fieldStats[a].count / jsonArray.length < 0.5 &&
				fieldStats[a].count > 1 && !fieldStats[a].isObject
		)
		.forEach((val) => {
			if (fieldStats[val].count > 1) {
				if (!fieldStats[val].isUrl) {
					const c = fieldStats[val].avgCommas
					const s = fieldStats[val].avgSpaces
					const len = fieldStats[val].longest.length
					const isList = c > 0 && s - c < 10 && len < 2000

					ff.push({
						title: val,
						field: val,
						isList: isList,
						order: !fieldStats[val].hasWordChar ? 'alpha' : 'frequency'
					})

					if (fieldStats[val].hasWordChar) sf.push(val)
				}
			}
		})

	// Fields for the card
	let cardFields = {
		poster: fieldStats.cardFields['poster'],
		title: fieldStats.cardFields['title'],
		plot: fieldStats.cardFields['plot']
	}

	console.log('ff', ff)
	console.log('sf', sf)

	return { ff: ff, sf: sf, cardFields: cardFields }
}

const BYOD = () => {
	const [data, setData] = useState([])
	const [filteredData, setFilteredData] = useState([])
	const [oneMovie, setOneMovie] = useState(null)
	const [page, setPage] = useState(0)
	const [query, setQuery] = useState('')
	const [spinnerDisplay, setSpinnerDisplay] = useState('block')
	const [filterFields, setFilterFields] = useState([])
	const [counts, setCounts] = useState([])
	const [searchFields, setSearchFields] = useState([])
	const [fieldStats, setFieldStats] = useState({})
	const [cardFields, setCardFields] = useState({})

	const getData = async () => {
		// setFilterFields(filterFields_v0)
		setSpinnerDisplay('none')
	}

	const handleFileRead = async (event) => {
		const content = event.target.result

		const itemArray = await csv.parse(content)

		// Convert array of arrays to array of json
		const header = itemArray[0]
		const jsonArray = itemArray
			.filter((_, idx) => idx > 0)
			.map((record, idx) => {
				let jsonLine = {}
				record.forEach((val, idx) => {
					jsonLine[header[idx]] = val
				})
				return jsonLine
			})

		const fieldStats = scanCSVData(jsonArray)
		const fields = pickFields(jsonArray, fieldStats)

		setCardFields(fields.cardFields)
		setFieldStats(fieldStats)
		setFilterFields(fields.ff)
		setSearchFields(fields.sf)

		setData(jsonArray)
		setFilteredData(jsonArray)

		setCounts(counts)
	}

	const uploadFile = (file) => {
		const reader = new FileReader()
		reader.onload = handleFileRead
		reader.readAsText(file)
	}
	const upload = (event) => {
		const file = event.target.elements['files'].files[0]
		uploadFile(file)
		event.preventDefault()
	}

	const getDataPostgres = async () => {
		const url = '/api/movies/get/'
		const response = await fetch(url)
		const data = await response.json()
		setData(data)
		setFilteredData(data)
		setSpinnerDisplay('none')
	}

	const isBottom = (el) => {
		return el.scrollTop + el.clientHeight + 1 > el.scrollHeight
	}

	const onScroll = (e) => {
		const el = e.nativeEvent.srcElement
		if (isBottom(el)) {
			nextPage()
		}
	}

	useEffect(() => {
		getData()
	}, [])

	const nextPage = (e) => {
		setPage(page + 1)
	}

	const selectedMovie = oneMovie ? (
		<OneMovie
			movie={oneMovie}
			setOneMovie={setOneMovie}
			setQuery={setQuery}
			fieldStats={fieldStats}
		/>
	) : null

	const start = page * MOVIES_PER_PAGE
	const end = start + MOVIES_PER_PAGE

	return (
		<div>
			<Head>
				<meta
					name='viewport'
					content='width=device-width, initial-scale=.5, maximum-scale=10.0, minimum-scale=.25, user-scalable=yes'
				/>
			</Head>
			<div className={styles.popup_background} style={{ display: spinnerDisplay }}>
				<div className={styles.spinner}></div>
			</div>
			<div className={styles.movies} onScroll={onScroll}>
				<form id='fileForm' encType='multipart/form-data' onSubmit={upload} method='post'>
					<input
						id='files'
						type='file'
						onChange={(e) => {
							const f = document.getElementById('fileForm')
							uploadFile(f.elements['files'].files[0])
						}}
					/>
				</form>

				<FilterPanel
					originalArray={data}
					callback={setFilteredData}
					query={query}
					filterFields={filterFields}
					searchFields={searchFields}
				/>
				<div id='app' className={styles.movie_cards}>
					<Cards
						filteredData={filteredData}
						counts={counts}
						start={start}
						end={end}
						setOneMovie={setOneMovie}
						cardFields={cardFields}
						fieldStats={fieldStats}
						setQuery={setQuery}
					/>
					{selectedMovie}
				</div>
			</div>
		</div>
	)
}

export default BYOD
