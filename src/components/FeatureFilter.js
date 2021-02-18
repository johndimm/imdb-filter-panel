import React, { useState, useEffect } from 'react'
import styles from './Movies.module.css'

const DEFAULT_NUM_USERS = 11
const MAXCHAR_CATEGORY = 20
const MAX_CHECKBOXES = 150

// Shorten a string to less than maxLen characters without truncating words.
function shorten(str, maxLen, separator = ' ') {
	if (str.length <= maxLen) return str
	return str.substr(0, str.lastIndexOf(separator, maxLen)) + ' . . .'
}

const FeatureFilter = ({
	title,
	originalArray,
	field,
	callback,
	mergedMasks,
	order
}) => {
	const [checkedBoxes, setCheckedBoxes] = useState({})
	const [showAll, setShowAll] = useState(false)

	const updateCounts = () => {
		let c = {}

		// Any checked categories must be displayed to allow the user to uncheck,
		// even if there are 0 users.
		Object.keys(checkedBoxes).forEach((item, idx) => {
			if (checkedBoxes[item]) c[item] = 0
		})

		originalArray
			.filter((e, idx) => mergedMasks.length === 0 || mergedMasks[idx])
			.forEach((item, idx) => {
				if (
					field in item &&
					[null, 'N/A', '', 'null'].indexOf(item[field]) == -1
				) {
					let v = item[field]
					if (v in c) c[v]++
					else c[v] = 1
				}
			})

		return c
	}

	const showMore = (more) => {
		setShowAll(more)
	}

	const checkboxClicked = (e) => {
		setCheckedBoxes({
			...checkedBoxes,
			[e.currentTarget.name]: e.currentTarget.checked
		})
	}

	const makeCheckbox = (val, idx, counts) => {
		let short = shorten(val, MAXCHAR_CATEGORY)

		if (short.length == 0) short = 'None'

		let count
		if (counts[val] > 1)
			count = <span className={styles.movie_count}>({counts[val]})</span>

		if (counts[val] !== 0) numPopulated++

		const color = counts[val] === 0 ? '#AAAAAA' : 'black'

		if (!showAll && idx >= DEFAULT_NUM_USERS) return null

		return (
			<div key={idx}>
				<label title={val} style={{ color: color }}>
					<input
						type='checkbox'
						onChange={checkboxClicked}
						name={val}
						checked={val in checkedBoxes && checkedBoxes[val]}
					/>
					{short} {count}
				</label>
			</div>
		)
	}

	useEffect(() => {
		// Create an array with just the selected values.
		let checkedCategories = []
		Object.keys(checkedBoxes).forEach((val) => {
			if (checkedBoxes[val]) checkedCategories.push(val)
		})

		// Generate the mask.
		const filterMask = originalArray.map((record, idx) => {
			return (
				checkedCategories.length === 0 ||
				checkedCategories.includes(record[field])
			)
		})

		// console.log('useEffect', checkedCategories, originalArray, filterMask)

		// Send to parent.
		callback(filterMask)
	}, [checkedBoxes])

	let numPopulated = 0
	const counts = updateCounts()

	let UI = Object.keys(counts)
		.sort((a, b) => {
			return order && order === 'alpha' ? b > a : counts[b] - counts[a]
		})
		.map((val, idx) => {
			return makeCheckbox(val, idx, counts)
		})

	// console.log(title, Object.keys(counts).length, counts)

	// This dimension has too many values, user needs to drill down to see it.
	const tooMany = Object.keys(counts).length > MAX_CHECKBOXES
	if (tooMany) {
		UI = Object.keys(checkedBoxes)
			.filter((el) => checkedBoxes[el])
			.map((val, idx) => {
				return makeCheckbox(val, idx, counts)
			})
	}

	if (UI.length === 0) return null

	let moreLink = null
	const leftOver = numPopulated - DEFAULT_NUM_USERS
	if (leftOver > 0 && !tooMany)
		moreLink = showAll ? (
			<div className={styles.more_link} onClick={(e) => showMore(false)}>
				... less ...
			</div>
		) : (
			<div className={styles.more_link} onClick={(e) => showMore(true)}>
				...{leftOver} more...
			</div>
		)

	return (
		<div className={styles.feature_filter}>
			<h3>{title}</h3>
			{UI}
			{moreLink}
		</div>
	)
}

export default FeatureFilter
