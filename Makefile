d3w-games-bundle.js: d3w-games.js node_modules/sim.js node_modules/cell.js node_modules/plots.js
	browserify $< > $@

clean:
	rm -f d3w-games-bundle.js
