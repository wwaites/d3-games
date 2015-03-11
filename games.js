var w = window.innerWidth > 960 ? 960 : (window.innerWidth || 960),
    h = window.innerHeight > 500 ? 500 : (window.innerHeight || 500),
    radius = 5.25,
    links = [],
    simulate = false;

var colours = { 
    cheat: "#c84554",
    coop: "#00c884"
};

var d3_geom_voronoi = d3.geom.voronoi()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; });

d3.select(window)
    .on("keydown", function() {
        // s
        if(d3.event.keyCode == 83) {
            simulate = !simulate
            if(simulate) {
		force.start()
            } else {
		force.stop()
            }
        }
    });

var svg = d3.select("#chart")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

var force = d3.layout.force()
    .charge(-30)
    .friction(0.1)
    .size([w, h])
    .on("tick", update);

var numVertices = 300;
var vertices = d3.range(numVertices).map(function(i) {
    angle = radius * (i+10);
    return {
	id: i,
	kind: "coop",
	food: {},
	x: Math.random()*w,
	y: Math.random()*h
/*
	x: angle*Math.cos(angle)+(w/2), 
	y: angle*Math.sin(angle)+(h/2)
*/
    }
});

var circle = svg.selectAll("circle");
var path = svg.selectAll("path");
var link = svg.selectAll("line");

function update(e) {
    path = path.data(d3_geom_voronoi(vertices))
    path.enter().append("path")
    // drag node by dragging cell
        .call(d3.behavior.drag()
              .on("drag", function(d, i) {
                  vertices[i].x = vertices[i].x + d3.event.dx
		  vertices[i].y = vertices[i].y + d3.event.dy
              })
             )
        .style("fill", function(d, i) { return "#00ffff" })
    path.attr("d", function(d) { return "M" + d.join("L") + "Z"; })
        .transition()
	.duration(150)
	.style("fill", function(d, i) { return colours[d.point.kind]; })
	.style("stroke-width", 1);
    path.exit().remove();
    
    circle = circle.data(vertices)
    circle.enter().append("circle")
        .attr("r", 0)
        .transition().duration(1000).attr("r", 1);
    circle
	.attr("id", function(d) { return "c" + d.id; })
	.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    circle.exit().transition().attr("r", 0).remove();
    circle
	.on("divide", divide)
	.on("food", eat)
	.on("death", die);

    link = link.data(d3_geom_voronoi.links(vertices))
    link.enter().append("line")
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })
    
    link.exit().remove()
    
    if(!simulate) force.stop()

}

// send a message to a node
function send(type, src, dst, msg, path) {
    // simple record-route to stop message cycles
    if (path == undefined)
	path = {}
    else {
	if (path[dst.id] != undefined)
	    return;
    }
    path[src.id] = true;

    var e = new CustomEvent(type, {
	detail: {
	    src: src,
	    dst: dst,
	    msg: msg,
	    rr: path
	}
    });
    d3.select("#c" + dst.id).each(function () {
	this.dispatchEvent(e); 
    });
}

// run a function on all of the neighbours of node d
function neighbours(d, f) {
    link
    // get the adjacencies involving this cell
	.filter(function (ld) {
	    if (ld.source.id == d.id) return true;
	    if (ld.target.id == d.id) return true;
	    return false;
	})
    // for each, run the given function on the other node
	.each(function(ld) {
	    if (ld.source.id == d.id)
		f(ld.target);
	    else
		f(ld.source);
	});
}

// return a sample from the exponential distribution
// with the given rate for inter-event timing
function exponential(rate) {
    return -1 * Math.log(Math.random()) / rate;
}

var division_rate = 0.1;
function division_timer(d) {
    function send_divide_event() {
	// do nothing if the simulation is paused
	if (!simulate) return true;
	// find the cell in question
	cell = circle.filter(function (n) { return n.id == d.id });
	// only send the event if the cell still exists
	if (cell.size() == 1) {
	    var e = new CustomEvent("divide");
	    cell.node().dispatchEvent(e);
	    // schedule the next division event
	    d3.timer(send_divide_event, exponential(division_rate) * 1000);
	}
	return true;
    }
    // start the division timer for the first time
    d3.timer(send_divide_event, exponential(division_rate) * 1000);
}

function death_timer(d) {
    function send_death_event() {
	// do nothing if the simulation is paused
	if (!simulate) return true;
	// find the cell in question
	cell = circle.filter(function (n) { return n.id == d.id });
	// only send the event if the cell still exists
	if (cell.size() == 1) {
	    var e = new CustomEvent("death");
	    cell.node().dispatchEvent(e);
	    // schedule the next division event
	    d3.timer(send_death_event, exponential(division_rate) * 1000);
	}
	return true;
    }
    // start the division timer for the first time
    d3.timer(send_death_event, exponential(division_rate) * 1000);
}
	
var production_rate = 1; // unit of food per unit time
function production_timer(d) {
    function send_produce_event() {
	// do nothing if the simulation is paused
	if (!simulate) return true;
	// find the cell in question
	cell = circle.filter(function (n) { return n.id == d.id });
	// only send the event if the cell still exists
	if (cell.size() == 1) {
	    var amount = production_rate;
	    if (d.kind == "cheat") // cheaters do not produce but must be counted
		amount = 0;
	    neighbours(d, function(n) {
		send("food", d, n, amount);
	    });
	    // schedule the next division event
	    d3.timer(send_produce_event, exponential(production_rate) * 1000);
	}
	return true;
    }
    d3.timer(send_produce_event, exponential(production_rate) * 1000);
}

var mutation_chance = 0.01;
function divide(d) {
    // possibly mutate
    var kind = d.kind;
    if (Math.random() < mutation_chance) {
	if (d.kind == "coop") kind = "cheat";
	else kind = "coop";
    }
    // divide in some random direction
    angle = Math.random() * 360;
    var child = {
	id: numVertices,
	kind: kind,
	food: {},
	x: d.x + Math.cos(angle)/w,
	y: d.y + Math.sin(angle)/h
    }

    // and put the timers on the child
    division_timer(child);
    production_timer(child);
    death_timer(child);

    // add to the list of cells and redo the layout
    numVertices = numVertices + 1;
    vertices.push(child);
    force.nodes(vertices).start()
}

var production_window = 10;
function eat(d) {
    var now = new Date().getTime()
    d.food[d3.event.detail.src.id] = {
	time: now,
	amount: d3.event.detail.msg
    };

    // expire old food events
    for (var i in d.food) {
	if (now - d.food[i].time > production_rate*production_window*1000) {
	    delete d.food[i];
	}
    }

    // do cheaters forward the event?
    if (d3.event.detail.rr.length <= 5) {
	neighbours(d, function(n) {
	    d3.event.detail.rr[d.id] = true
	    send("food", d3.event.detail.src, n, 
		 production_rate, d3.event.detail.rr);
	});
    }
}

// die with a certain probability
function die(d) {
    if (Math.random() < 1/fitness(d)) {
	vertices = vertices.filter(function (e) { return e.id != d.id; });
	force.nodes(vertices).start()
    }
}

function fitness(d) {
    var n = 0;
    var j = 0;
    for(var i in d.food) {
	j = j + d.food[i].amount;
	n = n + 1;
    }
    if (n == 0)
	return 1;
    return 1 / (1 + Math.exp(-30 * (j/n - 1/2)));
}


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
