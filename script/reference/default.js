graph = {
    "nodes": [
        {
            "proportions": [{ "group": 1, "value": 1 },
            { "group": 2, "value": 2 },
            { "group": 3, "value": 3 }]
        },
        {
            "proportions": [{ "group": 1, "value": 2 },
            { "group": 2, "value": 2 },
            { "group": 3, "value": 2 }]
        }],
    "links": [{ "source": 0, "target": 1, "length": 500, "width": 1 }]
}

var width = 960,
    height = 500,
    radius = 25,
    color = d3.scale.category10();

var pie = d3.layout.pie()
    .sort(null)
    .value(function (d) { return d.value; });

var arc = d3.svg.arc()
    .outerRadius(radius)
    .innerRadius(0);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var force = d3.layout.force()
    .charge(-120)
    .linkDistance(4 * radius)
    .size([width, height]);

force.nodes(graph.nodes)
    .links(graph.links)
    .start();

var link = svg.selectAll(".link")
    .data(graph.links)
    .enter().append("line")
    .attr("class", "link");

var node = svg.selectAll(".node")
    .data(graph.nodes)
    .enter().append("g")
    .attr("class", "node");

node.selectAll("path")
    .data(function (d, i) {console.log(d); return pie(d.proportions); })
    .enter()
    .append("svg:path")
    .attr("d", arc)
    .attr("fill", function (d, i) { return color(d.data.group); });;

force.on("tick", function () {
    link.attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; });

    node.attr("x", function (d) { return d.x; })
        .attr("y", function (d) { return d.y; })
        .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")" })
        ;
});