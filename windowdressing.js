
/**
 * Window dressing, sliders and stuff
 */
force.nodes(vertices).start();
d3.select("#start").on("click", function () {
    if (simulate) {
	this.value = "start";
    } else {
	circle.each(division_timer);
	circle.each(production_timer);
	circle.each(death_timer);
	this.value = "stop";
    }
    simulate = !simulate;
});

d3.select("#division").on("change", function () {
    division_rate = this.value;
    d3.select("#divisionLabel").text(division_rate);
}).each(function () {
    this.value = division_rate;
    d3.select("#divisionLabel").text(division_rate);
});

d3.select("#production").on("change", function () {
    production_rate = this.value;
    d3.select("#productionLabel").text(production_rate);
}).each(function () {
    this.value = production_rate;
    d3.select("#productionLabel").text(production_rate);
});

d3.select("#mutation").on("change", function () {
    mutation_chance = this.value;
    d3.select("#mutationLabel").text(mutation_chance);
}).each(function () {
    this.value = mutation_chance;
    d3.select("#mutationLabel").text(mutation_chance);
});

function mean(arr) {
    var m = d3.mean(arr);
    if (m == undefined)
	m = 0;
    return m;
}

function setup_payoff_plot() {
    var m = [0, 10, 25, 10];
    var w = 250 - m[1] - m[3];
    var h = 150 - m[0] - m[2];
    var xscale = d3.scale.linear().range([0, w]);
    var yscale = d3.scale.linear().range([h, 0]);

    var line = d3.svg.line()
	.x(function (d) { return xscale(d.x); })
	.y(function (d) { return yscale(d.y); })
	.interpolate("basis");

    var plot = d3.select("#payoff")
	.append("svg")
	.attr("width", w + m[1] + m[3])
	.attr("height", h + m[0] + m[2])
	.append("svg:g");

    plot.attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    var xaxis = d3.svg.axis().scale(xscale).ticks(4);
    plot.append("svg:g")
	.style("stroke", "#000")
	.style("fill", "none")
	.attr("transform", "translate(0," + h + ")")
	.call(xaxis);

    var payoff = plot.append("path")
	.style("stroke", "blue")
	.style("stroke-width", 1)
	.style("fill", "none");

    var update = function (n, x_n) {
	if (n == 0) n = 1;
	var samples = d3.range(0, x_n).map(function (x) {
	    return {
		x: x/x_n,
		y: 1/(1 + Math.exp(-30 * (x/n - 1/2)))
	    }
	});
	payoff.attr("d", line(samples));
    }

    return update;
}
var update_payoff_plot = setup_payoff_plot();

function update_counts() {
    d3.select("#cells").text(circle.size());
    d3.select("#cheaters").text(
	circle
	    .filter(function (d) { return d.kind == "cheat"; })
	    .size()
    );
    var nsize = [];
    var coopfit = [];
    var cheatfit = [];
    var fits = [];
    var food = [];
    circle.each(function (d) {
	var fit = fitness(d);
	if (d.kind == "coop")
	    coopfit.push(fit);
	else
	    cheatfit.push(fit);
	fits.push(fit);
	nsize.push(Object.keys(d.food).length);
	j = 0;
	for(var i in d.food) {
	    j = j + d.food[i].amount;
	}
	food.push(j);
    });
    d3.select("#neighbourhood").text(
	sprintf("%d/%.02f/%d", d3.min(nsize), mean(nsize), d3.max(nsize))
    );
    d3.select("#fitness").text(
	sprintf("%.02f/%.02f/%.02f", mean(coopfit), mean(cheatfit), mean(fits))
    );
    d3.select("#food").text(
	sprintf("%.02f/%.02f/%.02f", d3.min(food), mean(food), d3.max(food))
    );
    d3.timer(update_counts, 1000);

    update_payoff_plot(mean(nsize), d3.max(food));

    return true;
}
d3.timer(update_counts, 1000);
