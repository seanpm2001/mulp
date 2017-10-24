const path = require('path')
const fs = require('fs')
const gulp = require('gulp')
const changed = require('gulp-changed')
const rename = require('gulp-rename')

module.exports = {
	exportPaths,
	fractalTemplates
}

gulp.task('fractalTemplates', fractalTemplates)

function fractalTemplates(cb) {
	const resp = require(path.resolve(process.env.PWD, PATH_CONFIG.fractal.map))
	const fracts = []

	for (const key in resp) {
		const { src, dest, handle } = resp[key]
		fracts.push({ src, dest, handle })
	}

	return Promise.all(
		fracts.map(({ src, dest, handle }) => {
			return new Promise(resolve => {
				const d = path.resolve(process.env.PWD, PATH_CONFIG.fractal.craft, dest)
				gulp
					.src(path.resolve(process.env.PWD, src))
					.pipe(changed(d))
					.pipe(
						rename({
							basename: handle
						})
					)
					.pipe(gulp.dest(d))
					.on('end', resolve)
			})
		})
	)
}

function exportPaths(fractal) {
	return new Promise((resolve, reject) => {
		const map = {}
		for (let item of fractal.components.flattenDeep()) {
			const handle = item.handle.includes('--default')
				? item.handle.split('--default')[0]
				: item.handle

			const dest = path
				.resolve(process.env.PWD, item.viewDir)
				.split('templates/')[1]

			map[`@${handle}`] = {
				src: path.resolve(process.env.PWD, item.viewPath),
				dest: `fractal/${dest}`,
				handle: handle,
				file: `${handle}.twig`
			}
		}

		fs.writeFile(
			path.resolve(process.env.PWD, PATH_CONFIG.fractal.map),
			JSON.stringify(map, null, 2),
			'utf8',
			err => {
				if (err) {
					reject(err)
					return
				}
				resolve(map)
			}
		)
	})
}
