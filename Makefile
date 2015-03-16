d3w-games-bundle.js: d3w-games.js node_modules/sim.js node_modules/cell.js
	browserify $< > $@
