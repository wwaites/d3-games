var Cell = require("cell");
var Sim = require("sim");
var plots = require("plots");

global.sim = new Sim(Cell, "#chart");

sim.popSize = function () { return 300; }

var update_count_plot = plots.setup_count_plot(sim);
var update_benefit_plot = plots.setup_benefit_plot(sim);

d3.select("#start").on("click", function () {
    if (sim.running) {
	sim.pause();
	this.value = "resume";
    } else {
        if (sim.population.length == 0) {
            sim.resetPopulation();
	    setTimeout(update_benefit_plot, 1000, sim);
        }
	sim.resume();
	this.value = "pause";
    }
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
});

//sim.start();
//sim.resetPopulation();
//setTimeout(function (sim) { sim.stop(); }, 5000, sim);
