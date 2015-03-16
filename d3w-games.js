var Cell = require("cell");
var Sim = require("sim");

global.sim = new Sim(Cell, "#chart");

sim.popSize = function () { return 300; }

d3.select("#start").on("click", function () {
    if (sim.running) {
	sim.pause();
	this.value = "resume";
    } else {
	sim.resume();
	this.value = "pause";
    }
});

function exponential(rate) {
    return -1 * Math.log(Math.random()) / rate;
}

var division_rate = 0.1;
d3.select("#division").on("change", function () {
    division_rate = this.value;
    d3.select("#divisionLabel").text(division_rate);
    Cell.prototype.division.call(Cell, function () { return exponential(division_rate/1000); });
				 
}).each(function () {
    this.value = division_rate;
    d3.select("#divisionLabel").text(division_rate);
    Cell.prototype.division.call(Cell, function () { return exponential(division_rate/1000); });
});

var death_rate = 0.1;
d3.select("#death").on("change", function () {
    death_rate = this.value;
    d3.select("#deathLabel").text(death_rate);
    Cell.prototype.death.call(Cell, function () { return exponential(death_rate/1000); });
}).each(function () {
    this.value = death_rate;
    d3.select("#deathLabel").text(death_rate);
    Cell.prototype.death.call(Cell, function () { return exponential(death_rate/1000); });
});

var production_rate = 1;
d3.select("#production").on("change", function () {
    production_rate = this.value;
    d3.select("#productionLabel").text(production_rate);
    Cell.prototype.production.call(Cell, function () { return 1000/production_rate; });
}).each(function () {
    this.value = production_rate;
    d3.select("#productionLabel").text(production_rate);
    Cell.prototype.production.call(Cell, function () { return 1000/production_rate; });
});

var mutation_rate = 0.01;
d3.select("#mutation").on("change", function () {
    mutation_rate = this.value;
    d3.select("#mutationLabel").text(mutation_rate);
    sim.mutation(function () { return mutation_rate; });
}).each(function () {
    this.value = mutation_rate;
    d3.select("#mutationLabel").text(mutation_rate);
    sim.mutation(function () { return mutation_rate; });
});

var bias = 0.1;
d3.select("#bias").on("change", function () {
    bias = this.value;
    d3.select("#biasLabel").text(bias);
    Cell.prototype.bias.call(Cell, function () { return bias; });
}).each(function () {
    this.value = bias;
    d3.select("#biasLabel").text(bias);
    Cell.prototype.bias.call(Cell, function () { return bias; });
});

var charge = 250;
d3.select("#charge").on("change", function () {
    charge = this.value;
    d3.select("#chargeLabel").text(charge);
    sim.charge(-1 * charge);
}).each(function () {
    this.value = charge;
    d3.select("#chargeLabel").text(charge);
    sim.charge(-1 * charge);
});

var friction = 0.1;
d3.select("#friction").on("change", function () {
    friction = this.value;
    d3.select("#frictionLabel").text(friction);
    sim.friction(friction);
}).each(function () {
    this.value = friction;
    d3.select("#frictionLabel").text(friction);
    sim.friction(friction);
});

function setup_count_plot(sim) {
    var m = [0, 10, 25, 10];
    var w = 250 - m[1] - m[3];
    var h = 150 - m[0] - m[2];
    var xscale = d3.scale.linear().range([0, w]);
    var yscale = d3.scale.linear().range([h, 0]);

    var line = d3.svg.line()
	.x(function (d) { return xscale(d.x); })
	.y(function (d) { return yscale(d.y); })
	.interpolate("basis");

    var plot = d3.select("#plots")
	.append("svg")
	.attr("width", w + m[1] + m[3])
	.attr("height", h + m[0] + m[2])
	.append("svg:g");

    plot.attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    var xaxis = d3.svg.axis().scale(xscale).ticks(0);
    plot.append("svg:g")
	.style("stroke", "#000")
	.style("fill", "none")
	.attr("transform", "translate(0," + h + ")")
	.call(xaxis);

    var cheaters = plot.append("path")
	.style("stroke", sim.colours["cheat"])
	.style("stroke-width", 1)
	.style("fill", "none");

    var cooperators = plot.append("path")
	.style("stroke", sim.colours["coop"])
	.style("stroke-width", 1)
	.style("fill", "none");

    var total = plot.append("path")
	.style("stroke", "blue")
	.style("stroke-width", 1)
	.style("fill", "none");

    var counts = [];

    var update_counts = function(sim, now) {
	var coop = 0;
	var cheat = 0;
	var total = sim.population.length;
	for (var i=0; i<sim.population.length; i++) {
	    if(sim.population[i].kind == "coop") coop += 1;
	    else cheat += 1;
	}
	counts.push({
	    time: now, 
	    coop: coop,
	    cheat: cheat,
	    total: total
	});
    }

    update_counts(sim, 0);

    var update = function (sim, now) {
	update_counts(sim, now);
	xscale.domain([0, now]);
	yscale.domain([0, d3.max(counts.map(function (c) { return c.total; }))]);
	cheaters.attr("d", line(counts.map(function (c) {
	    return { x: c.time, y: c.cheat };
	})));
	cooperators.attr("d", line(counts.map(function (c) {
	    return { x: c.time, y: c.coop };
	})));
	total.attr("d", line(counts.map(function (c) {
	    return { x: c.time, y: c.total };
	})));
    }

    return update;
}

var update_count_plot = setup_count_plot(sim);
var start = new Date().getTime();				  

sim.on("step", function () {
    var now = new Date().getTime();
    update_count_plot(this, now - start);
});

//sim.start();
//sim.resetPopulation();
//setTimeout(function (sim) { sim.stop(); }, 5000, sim);
