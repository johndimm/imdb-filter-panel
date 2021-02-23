
(https://raw.githubusercontent.com/johndimm/imdb-filter-panel/main/public/movies.png)

[5273 Movies](http://54.169.121.112:3001/)

https://docs.google.com/spreadsheets/d/1Kt0em3UqSSLBC186MyPs1Y3g8w_PqGNEGWiTIpRD7Lc/edit?usp=sharing



The code uses document masks, which are simple arrays of boolean values, one for each "document" in the database (user, movie, geometric object).  An entry is True if that item should be displayed according to this filter.  This makes it easy for the filters to work independently, but still react to changes in the states of other filters.

Each feature filter manages a single column of the table.  When the user clicks on a checkbox, it calculates the output mask over all records in the original array.  

```jsx
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
```

Using a callback, the output mask is sent up to the Filter Panel, where it is aggregated with the output masks from the other Feature Filters to update the list of input masks.  The input masks are sent down to the corresponding Feature Filter as a state parameter.

```jsx
outputMasks[sourceIdx] = outputMask
		setoutputMasks(outputMasks)

		// Make a mask for each filter that merges all the other filter masks.
		const inputMasks = outputMasks.map((outputMask, filterIdx) => {
			return outputMask.map((val, idx) => {
				let allTrue = true
				for (var i = 0; i < outputMasks.length; i++) {
					if (i != filterIdx && !outputMasks[i][idx]) {
						allTrue = false
						break
					}
				}
				return allTrue
			})
		})

		setinputMasks(inputMasks)
```

It is important to avoid causing an update to the filter that caused the change in state for two reasons:  1) to avoid an infinite update loop and 2) because we want the originating filter to remain in place.  Otherwise, the originating filter would be reduced to a single line.

The goals of this approach:

- each filter shows the current counts based on user selections in other filters
- every link produces data, there are no dead links

The Galigo Filter Panel also includes Search, using a wrapper.

The flow:

- user clicks on a checkbox
- FeatureFilter calculates output mask
    - each filter does a pass through the database
- sends it to FilterPanel using callback
- FilterPanel receives output masks from all filters
- computes input mask for each filter
    - the intersection of all other output masks
        - not including the filter itself

- sends updated input masks down to each filter
- filters recompute their local counts over their own items
