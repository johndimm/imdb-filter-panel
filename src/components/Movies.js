import React, { useEffect, useState } from 'react'
import FilterPanel from './FilterPanel'
import styles from './Movies.module.css'
import Head from 'next/head'
import { delBasePath } from 'next/dist/next-server/lib/router/router'

const MOVIES_PER_PAGE = 30

const filterFields = [
	{ title: 'Genre', field: 'genre', isList: true },
	{ title: 'Awards and Nominations', field: 'big_award' },
	{ title: 'Country', field: 'country', isList: true },
	{ title: 'Language', field: 'language', isList: true },
	{ title: 'Content Rating', field: 'rated' },
	{ title: 'IMDB Rating', field: 'rating', order: 'alpha' },
	{ title: 'Actor', field: 'actors', isList: true },
	{ title: 'Director', field: 'director', isList: true },
	{ title: 'Writer', field: 'writer', isList: true },
	{ title: 'Production', field: 'production', isList: true },
	{ title: 'Decade', field: 'decade', order: 'alpha' },
	{ title: 'Year', field: 'year', order: 'alpha' }
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
	'released',
	'actors',
	'director',
	'writer',
	'production',
	'country',
	'language',
	'awards',
	'boxoffice',
	'dvd'
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
				<img src={movie.poster} onError={ (e) => onError(e, movie)} onLoad={onLoad} />

				<div className={styles.one_movie_title}>{movie.title}</div>
				<div>{movie.plot}</div>
				<div className={styles.movie_details}>{detail}</div>
				<b>Links:</b>
				<a target='_new' href={'//imdb.com/title/' + movie.imdbid}>
					IMDB
				</a>
				<a target='_new' href={movie.tomatourl}>
					Rotten Tomatoes
				</a>
				<a target='_new' href={movie.website}>
					Website
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

const updatePoster = async (movie, posterURL) => {
  console.log ("updatePoster", movie, posterURL)
  if (movie.imdbid == null || posterURL == null)
    return

  const url = `/api/movies/poster/update/${movie.imdbid}/${encodeURIComponent(posterURL)}`
  const response = await fetch(url)
  const data = await response.json()
  console.log("updated the poster", data.imdbid, data.posterURL)
}

const fetchOMDBPoster = async (e, movie) => {
	console.log('Bad poster for ', movie)
    const url = `http://www.omdbapi.com/?i=${movie.imdbid}&apikey=985c8d27`
    const response = await fetch(url)
	const data = await response.json()
	updatePoster(movie, data.Poster)

	// Set the source of the current movie poster that generated the request.
	e.target.src= data.Poster
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

const Card = ({ movie, onClick }) => {
	return (
		<div className={styles.movie_card} onClick={onClick} title={movie.title}>
			<div className={styles.movie_title}>{movie.title}</div>
			<div className={styles.movie_plot}>{movie.plot}</div>
			<div>
				<img src={movie.poster} onError={ (e) => onError(e, movie)} onLoad={onLoad} />
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
	const [spinnerDisplay, setSpinnerDisplay] = useState('block')

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
		const getData = async () => {
			const url = '/api/movies/get/'
			const response = await fetch(url)
			const data = await response.json()
			setData(data)
			setFilteredData(data)
			setSpinnerDisplay('none')
		}

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
		<div>
			<Head>
				<meta
					name='viewport'
					content='width=device-width, initial-scale=.5, maximum-scale=10.0, minimum-scale=.25, user-scalable=yes'
				/>
			</Head>
			<div
				className={styles.popup_background}
				style={{ display: spinnerDisplay }}
			>
				<div className={styles.spinner}></div>
			</div>
			<div className={styles.movies} onScroll={onScroll}>
				<FilterPanel
					originalArray={data}
					callback={setFilteredData}
					query={query}
					filterFields={filterFields}
					searchFields={searchFields}
				/>
				<div id='app' className={styles.movie_cards}>
					{movie_cards}
					{selectedMovie}
				</div>
			</div>
		</div>
	)
}

export default Movies
