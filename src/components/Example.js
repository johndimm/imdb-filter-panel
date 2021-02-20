import React, { useEffect, useState } from 'react'
import FilterPanel from './FilterPanel'
import styles from './Movies.module.css'
import Head from 'next/head'

const MOVIES_PER_PAGE = 30

const filterDef = [
	{ title: 'Size', field: 'size' },
	{ title: 'Color', field: 'color' },
	{ title: 'Shape', field: 'shape' }
]

const searchFields = ['name']

const detailFields = ['size', 'color', 'shape']

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
	const width = { small: '25px', medium: '75px', large: '150px' }
	return (
		<div className={styles.example_card} onClick={onClick} title={movie.title}>
			<div>
				<img
					src={movie.image}
					onError={onError}
					onLoad={onLoad}
					style={{ width: width[movie.size] }}
				/>
				<br />
				{movie.name}
			</div>
		</div>
	)
}

const Example = () => {
	const [data, setData] = useState([])
	const [filteredData, setFilteredData] = useState([])
	const [page, setPage] = useState(0)
	const [query, setQuery] = useState('')
	const [spinnerDisplay, setSpinnerDisplay] = useState('block')

	const getData = async () => {
		const url = '/api/example/get/'
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

	const selectedMovie = null

	const start = page * MOVIES_PER_PAGE
	const end = start + MOVIES_PER_PAGE
	const movie_cards = filteredData
		.filter((val, idx) => idx < end)
		.map((val, idx) => {
			return <Card movie={val} key={idx} />
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
					className={styles.filter_panel}
					query={query}
					filterDef={filterDef}
					searchFields={searchFields}
					debug={true}
				/>
				<div id='app' className={styles.movie_cards}>
					{movie_cards}
					{selectedMovie}
				</div>
			</div>
		</div>
	)
}

export default Example
