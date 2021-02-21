import React, { useState, useEffect } from 'react'
import styles from './Movies.module.css'
import FeatureFilter from './FeatureFilter'
import SearchFilter from './SearchFilter'

const FilterPanel = ({
	originalArray,
	callback,
	query,
	filterDef,
	searchFields,
	debug
}) => {
	const [sourceMasks, setSourceMasks] = useState([])
	const [mergedMasks, setMergedMasks] = useState([])

	useEffect(() => {
		// Load the arrays with "true", so everything is by default on.
		const m = originalArray.map((val, idx) => {
			return true
		})

		let ms = []
		for (var i = 0; i < filterDef.length + 1; i++) ms.push(m)

		setSourceMasks(ms)
		setMergedMasks(ms)
	}, [originalArray])

	const aggregateMasks = (sourceIdx, filterMask) => {
		sourceMasks[sourceIdx] = filterMask
		setSourceMasks(sourceMasks)

		// Make a mask for each filter that merges all the other filter masks.
		const mergedMasks = sourceMasks.map((sourceMask, idxSM) => {
			return sourceMask.map((val, idx) => {
				let allTrue = true
				for (var i = 0; i < sourceMasks.length; i++) {
					if (i != idxSM && !sourceMasks[i][idx]) {
						allTrue = false
						break
					}
				}
				return allTrue
			})
		})

		setMergedMasks(mergedMasks)

		let globalMask = []
		filterMask.forEach((val, idx) => {
			let allTrue = val
			for (var i = 0; i < sourceMasks.length; i++) {
				if (!sourceMasks[i][idx]) {
					allTrue = false
					break
				}
			}
			globalMask.push(allTrue)
		})

		// Send results to parent.
		let filteredData = []
		globalMask.forEach((val, idx) => {
			if (val) filteredData.push(originalArray[idx])
		})

		callback(filteredData)
	}

	const filters = filterDef.map((val, idx) => {
		const sortOrder = 'order' in val ? val.order : 'frequency'

		const debugMasks =
			idx in mergedMasks && idx in sourceMasks && debug ? (
				<div className={styles.debug}>
					in:{' '}
					{JSON.stringify(mergedMasks[idx])
						.replace(/true/g, '1')
						.replace(/false/g, '0')}
					<br />
					out:{' '}
					{JSON.stringify(sourceMasks[idx])
						.replace(/true/g, '1')
						.replace(/false/g, '0')}
				</div>
			) : null

		return (
			<div key={idx}>
				<FeatureFilter
					title={val.title}
					originalArray={originalArray}
					field={val.field}
					order={sortOrder}
					callback={(data) => aggregateMasks(idx, data)}
					mergedMasks={mergedMasks[idx]}
					isList={val.isList}
				/>
				{debugMasks}
			</div>
		)
	})

	const idx = filterDef.length

	// console.log('FilterPanel, query', query)

	return (
		<div className={styles.filter_panel}>
			<SearchFilter
				title='Search'
				originalArray={originalArray}
				callback={(data) => aggregateMasks(idx, data)}
				mergedMasks={mergedMasks[idx]}
				query={query}
				searchFields={searchFields}
			/>
			{filters}
		</div>
	)
}

export default FilterPanel
