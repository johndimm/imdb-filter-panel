import styles from './Movies.module.css'

const TitleBar = () => {
	return (
		<div className={styles.title_bar}>
			<div className={styles.app_name}>5273 Movies</div>
			<div className={styles.app_info}>
				<a href='https://data.world/studentoflife/imdb-top-250-lists-and-5000-or-so-data-records'>
					data
				</a>
				<br />
				<a href='https://github.com/johndimm/imdb-filter-panel'>code</a>
			</div>
		</div>
	)
}

export default TitleBar
