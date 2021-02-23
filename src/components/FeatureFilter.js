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
	inputMasks,
	order,
	isList
}) => {
	const [checkedBoxes, setCheckedBoxes] = useState({})
	const [showAll, setShowAll] = useState(false)

	const truncateAt = (s, c) => {
		let v = s
		const parenLoc = v.indexOf(c)
		if (parenLoc != -1) {
			v = v.substr(0, parenLoc)
		}
		return v
	}

	const updateCounts = () => {
		let c = {}

		const updateHash = (v) => {
			if (v in c) c[v]++
			else c[v] = 1
		}
		// Any checked categories must be displayed to allow the user to uncheck,
		// even if there are 0 users.
		Object.keys(checkedBoxes).forEach((item, idx) => {
			if (checkedBoxes[item]) c[item] = 0
		})

		originalArray
			.filter((e, idx) => inputMasks.length === 0 || inputMasks[idx])
			.forEach((item, idx) => {
				if (
					field in item &&
					[null, 'N/A', '', 'null'].indexOf(item[field]) == -1
				) {
					let v = item[field]
					if (isList) {
						const parts = v.split(', ')
						parts.forEach((val) => {
							updateHash(truncateAt(val, ' ('))
						})
					} else {
						updateHash(v)
					}
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

	const selectOnly = (val) => {
		const cb = {}
		cb[val] = true
		setCheckedBoxes(cb)
	}

	const sortCategories = (order, a, b, countsa, countsb) => {
		if (order === 'frequency') {
		   // Major sort by counts, minor by alpha.
		   if (countsb != countsa)
             return countsb - countsa
		}

		var nameA=a.toLowerCase(), nameB=b.toLowerCase();
		if (nameA < nameB) //sort string ascending
			return -1;
		if (nameA > nameB)
			return 1;
		return 0;
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
				<input
					type='checkbox'
					onChange={checkboxClicked}
					name={val}
					checked={val in checkedBoxes && checkedBoxes[val]}
				/>
				<span
					className={styles.checkbox_labelish}
					title={val}
					style={{ color: color }}
					onClick={(e) => selectOnly(val)}
				>
					{short} {count}
				</span>
			</div>
		)
	}

	useEffect(() => {
		// Create an array with just the selected categories.
		let checkedCategories = []
		Object.keys(checkedBoxes).forEach((val) => {
			if (checkedBoxes[val]) checkedCategories.push(val)
		})

		const checkList = (val) => {
			const parts = val.split(', ')
			let guess = false
			parts.forEach((val) => {
				const v = truncateAt(val, ' (')
				if (checkedCategories.includes(v)) guess = true
			})
			return guess
		}

		// Generate the output mask.
		const outputMask = originalArray.map((record, idx) => {
			// If nothing is checked, it's as if everything were checked.
			if (checkedCategories.length === 0) return true

			if (isList) {
				return checkList(record[field])
			} else {
				return checkedCategories.includes(record[field])
			}
		})

		// console.log('useEffect', checkedCategories, originalArray, outputMask)

		// Send to parent.
		callback(outputMask)
	}, [checkedBoxes])

	let numPopulated = 0
	const counts = updateCounts()

	let UI = Object.keys(counts)
		.sort((a, b) => {
            return sortCategories(order, a, b, counts[a], counts[b])
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
