import React, { useEffect, useState } from 'react'
import FilterPanel from './FilterPanel'
import styles from './Movies.module.css'

const MOVIES_PER_PAGE = 30

const filterDef = [
	{ title: 'Genre', field: 'genre1' },
	{ title: 'Decade', field: 'decade', order: 'alpha' },
	{ title: 'Year', field: 'year' },
	{ title: 'Type', field: 'type' },
	{ title: 'Language', field: 'language1' },
	{ title: 'Country', field: 'country1' },
	{ title: 'Content Rating', field: 'rated' },
	{ title: 'IMDB Rating', field: 'rating', order: 'alpha' },
	{ title: 'Actor', field: 'actor1' },
	{ title: 'Director', field: 'director1' },
	{ title: 'Writer', field: 'writer1' },
	{ title: 'Production', field: 'production' }
]

const searchFields = [
	'title',
	'plot',
	'actors',
	'writer',
	'director',
	'production'
]

const detailFields = [
	'genre',
	'actors',
	'director',
	'writer',
	'production',
	'country',
	'language',
	'awards'
]

const OneMovie = ({ movie, setOneMovie, setQuery }) => {
	const detail = detailFields.map((s, idx) => {
		const name = s.charAt(0).toUpperCase() + s.slice(1)

		const list = movie[s]
		const parts = list.split(',')
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

	return (
		<div className={styles.popup_background} onClick={(e) => setOneMovie(null)}>
			<div className={styles.one_movie}>
				<img src={movie.poster} onError={onError} onLoad={onLoad} />

				<div className={styles.one_movie_title}>{movie.title}</div>
				<div>{movie.plot}</div>
				<div className={styles.movie_details}>{detail}</div>
				<a target='_new' href={'//imdb.com/title/' + movie.imdbid}>
					IMDB
				</a>
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

const onError = (e) => {
	// Turn display off, because this may be a bad image link.
	// But it could also something innocuous that actually
	// doesn't prevent the image from displaying.
	e.currentTarget.style.display = 'none'
	e.preventDefault()
	e.target.onerror = null
}

const Card = ({ movie, onClick }) => {
	return (
		<div className={styles.movie_card} onClick={onClick}>
			<div className={styles.movie_title}>{movie.title}</div>
			<div className={styles.movie_plot}>{movie.plot}</div>
			<div>
				<img src={movie.poster} onError={onError} onLoad={onLoad} />
			</div>
		</div>
	)
}

const Movies = () => {
	const [data, setData] = useState([])
	const [filteredData, setFilteredData] = useState([])
	const [oneMovie, setOneMovie] = useState(null)
	const [page, setPage] = useState(0)
	const [query, setQuery] = useState('')

	const getData = async () => {
		const url = '/api/movies/get/'
		const response = await fetch(url)
		const data = await response.json()
		setData(data)
		setFilteredData(data)
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
		<OneMovie movie={oneMovie} setOneMovie={setOneMovie} setQuery={setQuery} />
	) : null

	const start = page * MOVIES_PER_PAGE
	const end = start + MOVIES_PER_PAGE
	const movie_cards = filteredData
		.filter((val, idx) => idx < end)
		.map((val, idx) => {
			return <Card movie={val} key={idx} onClick={(e) => setOneMovie(val)} />
		})

	return (
		<div className={styles.movies} onScroll={onScroll}>
			<FilterPanel
				originalArray={data}
				callback={setFilteredData}
				className={styles.filter_panel}
				query={query}
				filterDef={filterDef}
				searchFields={searchFields}
			/>
			<div id='app' className={styles.movie_cards}>
				{movie_cards}
				{selectedMovie}
			</div>

			<div id='main-div'>
				<div id='spinner'></div>
			</div>
		</div>
	)
}

export default Movies
