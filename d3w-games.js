var Cell = require("cell");
var Sim = require("sim");
var plots = require("plots");

global.sim = new Sim(Cell, "#chart");

sim.popSize = function () {
    return d3.select("#population").attr("value");
}

d3.select("#population").on("change", function () {
    var v = this.value;
    sim.popSize = function () {
	return v;
    };
});

var update_count_plot = plots.setup_count_plot(sim);
var update_benefit_plot = plots.setup_benefit_plot(sim);

d3.select("#start").on("click", function () {
    if (sim.running) {
	sim.pause();
	d3.select(this).text("resume");
    } else {
        if (sim.population.length == 0) {
            sim.resetPopulation();
        }
	sim.resume();
	d3.select(this).text("pause");
    }
});

d3.select("#reset").on("click", function () {
    var wasrunning = sim.running;
    if (wasrunning) sim.pause();
    sim.resetPopulation();
    if (wasrunning) sim.resume();
});

function exponential(rate) {
    return -1 * Math.log(Math.random()) / rate;
}

var division_rate = 0.16;
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

var bias = 0.2;
d3.select("#bias").on("change", function () {
    bias = this.value;
    d3.select("#biasLabel").text(bias);
    Cell.prototype.bias = function () { return bias; };
}).each(function () {
    this.value = bias;
    d3.select("#biasLabel").text(bias);
    Cell.prototype.bias = function () { return bias; };
});

var cost = 1;
d3.select("#cost").on("change", function () {
    cost = this.value;
    d3.select("#costLabel").text(cost);
    Cell.prototype.cost = function () { return cost; };
}).each(function () {
    this.value = cost;
    d3.select("#costLabel").text(cost);
    Cell.prototype.cost = function () { return cost; };
});

var sigma = -30;
d3.select("#sigma").on("change", function () {
    sigma = this.value;
    d3.select("#sigmaLabel").text(sigma);
    Cell.prototype.sigma = function () { return sigma; };
    update_benefit_plot(sim);
}).each(function () {
    this.value = sigma;
    d3.select("#sigmaLabel").text(sigma);
    Cell.prototype.sigma = function () { return sigma; };
    update_benefit_plot(sim);
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

var start = new Date().getTime();				  

sim.on("step", function () {
    var now = new Date().getTime();
    update_count_plot(this, now - start);
    var stats = sim.population.map(function (c) { return c.stats(); });
    var degree = d3.mean(sim.population.map(function (c) { 
	return c.neighbours().length; 
    }));
    var neighbourhood = d3.mean(stats.map(function (s) { return s.neighbours; }));
    var coop = d3.mean(stats.map(function (s) { return s.cooperators; }));
    var cheat = d3.mean(stats.map(function (s) {
	return s.neighbours - s.cooperators;
    }));
    d3.select("#counts_n").text(Math.round(degree*100)/100);
    d3.select("#counts_nc").text(Math.round(coop*100)/100);
    d3.select("#counts_nd").text(Math.round(cheat*100)/100);
    d3.select("#counts_nh").text(Math.round(neighbourhood*100)/100);
});

//sim.start();
//sim.resetPopulation();
//setTimeout(function (sim) { sim.stop(); }, 5000, sim);
