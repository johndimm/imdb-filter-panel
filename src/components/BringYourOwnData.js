import React, { useEffect, useState } from 'react'
import FilterPanel from './FilterPanel'
import styles from './Movies.module.css'
import Head from 'next/head'
import { delBasePath } from 'next/dist/next-server/lib/router/router'
import csv from 'csvtojson'

const MOVIES_PER_PAGE = 30

const OneMovie = ({ movie, setOneMovie, setQuery }) => {
	const detail = Object.keys(movie).map((s, idx) => {
		const name = s.charAt(0).toUpperCase() + s.slice(1)

        console.log("OneMovie, name:", name)
		const list = movie[s]
        console.log("list:", list)
        const parts = (typeof list === 'string')
          ? list.split(',')
          : []

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
		<div className={styles.movie_card} onClick={onClick} title={movie.ritle}>
			<div className={styles.movie_title}>{movie.Title}</div>
			<div className={styles.movie_plot}>{movie.Plot}</div>
			<div>
				<img src={movie.Poster} onError={ (e) => onError(e, movie)} onLoad={onLoad} />
			</div>
		</div>
	)
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

    const getData = async () => {
        // setFilterFields(filterFields_v0)
		setSpinnerDisplay('none')
    }


    const handleFileRead = async (event) => {
        const content = event.target.result;

        const jsonArray = await csv().fromString(content)

       // console.log("jsonArray:", jsonArray)

       setData(jsonArray)
       setFilteredData(jsonArray)

       const fields = Object.keys(jsonArray[0])
       let distinct = {}
       fields.forEach( (fieldName, idx) => {
          distinct[fieldName] = {}
       })

       jsonArray.forEach ( (jsonRow) => {
         fields.forEach( (fieldName) => {
             const val = jsonRow[fieldName]
            distinct[fieldName][val] = 1
         })
       })
       let counts = {}
       Object.keys(distinct).forEach ( ( fieldName ) => {
            counts[fieldName] = Object.keys(distinct[fieldName]).length
       })

       console.log("counts", counts)

       let ff = []
       Object.keys(counts).sort ( (a, b) => counts[a] - counts[b]).forEach ( (val) => {
           if (counts[val] > 1)
             ff.push({title:val, field: val, isList: false})
           console.log(val + ":" + counts[val])
       })
       setFilterFields(ff)

       let sf = []
       const d = jsonArray[0]
       Object.keys(d).forEach ( ( fieldName ) => {
           const val = d[fieldName] 
           if (val.match(/\w+/))
             sf.push(fieldName)
       }) 

       setSearchFields(sf);

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
		<OneMovie movie={oneMovie} setOneMovie={setOneMovie} setQuery={setQuery} />
	) : null

	const start = page * MOVIES_PER_PAGE
	const end = start + MOVIES_PER_PAGE
    let header
	const movie_cards = filteredData
		.filter((val, idx) => idx < end)
		.map((val2, idx2) => {
            const columns = Object.keys(val2)
              .sort ( (a, b) => counts[b] - counts[a])
              .filter ( (val, idx) => idx < 6)
              .map (
                 (fieldName, idx3) => <td 
                   key={idx3} 
                   onClick={(e) => setOneMovie(val2)}
                 >{val2[fieldName]}</td>
            )

            if (!header) 
              header = Object.keys(val2)
                .sort ( (a, b) => counts[b] - counts[a])
                .filter ( (val, idx) => idx < 6)
                .map ( (fieldName, idx) => <th key={idx}>{fieldName}</th> )

            return <tr key={idx2}>{columns}  </tr>
			// return <Card movie={val} key={idx} onClick={(e) => setOneMovie(val)} />
		})

   // const header = filteredData.length > 0
   //   ? Object.keys(filteredData[0]).map ( (fieldName, idx) => <th key={idx}>{fieldName}</th> )
   //   : []

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
            
                <form id='fileForm' encType="multipart/form-data" onSubmit={upload} method="post">
                    <input id="files" type="file" onChange={ (e) => { 
						const f = document.getElementById("fileForm")
						uploadFile(f.elements['files'].files[0])
						}}/>
                </form>
			
            	<FilterPanel
					originalArray={data}
					callback={setFilteredData}
					query={query}
					filterFields={filterFields}
					searchFields={searchFields}
				/>
				<div id='app' className={styles.movie_cards}>
                    <table>
                        <thead>
                            <tr>
                              {header}
                            </tr>
                        </thead>
                        <tbody>
                            {movie_cards}
                        </tbody>
                    </table>
					{selectedMovie}
				</div>
			</div>
		</div>
	)
}

export default BYOD
