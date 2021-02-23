import React, { useState, useEffect } from 'react'
import styles from './Movies.module.css'

const SearchFilter = ({
	title,
	originalArray,
	callback,
	query,
	searchFields
}) => {
	const [queryString, setQueryString] = useState(query)

	const performSearch = (query) => {
		let searchMask
		if (query === '') searchMask = originalArray.map((val) => true)
		else {
			const regex = new RegExp(query, 'i')
			searchMask = originalArray.map((val, idx) => {
				let found = false
				for (var i = 0; i < searchFields.length; i++) {
					if (regex.test(val[searchFields[i]])) {
						found = true
						break
					}
				}
				return found
			})

			setQueryString(query)
		}

		callback(searchMask)
	}

	useEffect(() => {
		if (query && query.length > 0) {
			performSearch(query)
		}
	}, [query])

	const changeQuery = (_query, e) => {
		// console.log('changeQuery', _query, e)

		query = _query
		setQueryString(query)
		performSearch(query)
		e.preventDefault()
	}

	const onChange = (e) => {
		changeQuery(e.currentTarget.value, e)
	}

	const clearSearch = (e) => {
		changeQuery('', e)
	}

	const noOp = (e) => e.preventDefault()

	return (
		<div className={styles.feature_filter}>
			<h3>{title}</h3>
			<form onSubmit={noOp}>
				<input
					type='text'
					name='query'
					onChange={onChange}
					value={queryString}
				/>
				<span className={styles.clear_search} onClick={clearSearch}>
					X
				</span>
			</form>
		</div>
	)
}

export default SearchFilter
