//data importer

CSVreader("/dataset/section1.csv").then(function (data) {
    //parser
    var dataFoS=[];
    var dataNumOnly = JSON.parse(JSON.stringify(data));
    for (var i in data) {
        for (var j in data[i]) {
            if (j != "Field of study (Broad)" && j != "Field of study (Narrow)") {
                data[i][j] = +data[i][j];

                if (j == "Total" || j == "date" || j == "close") {
                    delete dataNumOnly[i][j]
                }
                else {
                    dataNumOnly[i][j] = +dataNumOnly[i][j];
                }
            }
            else {
                if(j == "Field of study (Broad)"&&data[i][j]!=""&&data[i][j]!="Total"){
                    console.log("find a field")
                    dataFoS.push(data[i][j].substring(0,data[i][j].length-7))
                }
                
                delete dataNumOnly[i][j]
            }
        }
    }

    var width = 1300,
        height = 1200,
        baseRadius = 100;

    for (var i in dataNumOnly) {
        // console.log(dataNumOnly[i])
        if (data[i]["Field of study (Broad)"] && data[i]["Field of study (Broad)"] != "Total") {
            dataNumOnly[i] = d3.entries(dataNumOnly[i])
            var precent = data[i]["Total"] / 385050 * 12;
            for (var j in dataNumOnly[i]) {
                dataNumOnly[i][j].radius = precent * baseRadius + 20
            }
        }
        else {
            delete dataNumOnly[i]
        }


    }
    dataNumOnly = dataNumOnly.filter((item) => {
        return item !== null && typeof item !== "undefined" && item !== "";
    });
    console.log(dataFoS);
    // console.log(dataNumOnly);



    var pie = d3.layout.pie()
        .sort(null)
        .value(function (d) { return d.value; });
    // console.log(pie(d3.entries(dataNumOnly[0])))

    var arc = d3.svg.arc()
        .outerRadius(function (d) { return Math.sqrt(d.data.radius) * 5.75; })
        .innerRadius(function (d) { return Math.sqrt(d.data.radius) * 8.25; });

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    var force = d3.layout.force()
        .charge(-2600)
        // .linkDistance(4 * baseRadius)
        .size([width, height]);

    force.nodes(dataNumOnly)
        // .links(graph.links)
        .start();

    // var link = svg.selectAll(".link")
    //     .data(graph.links)
    //     .enter().append("line")
    //     .attr("class", "link");

    var node = svg.selectAll(".node")
        .data(dataNumOnly)
        .enter().append("g")
        .attr("class", "node")
        .call(force.drag);

    mainColor = randomColorSequential();
    node.selectAll("path")
        .data(function (d, i) {
            // console.log("set data")
            return pie(d);
        })
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", function (d, i) {
            if (i == 0) {
                mainColor = randomColorSequential()
            }
            // console.log("set color "+i)
            color = d3.scale.ordinal()
                .domain(d3.range(10))
                .range(rampColor(mainColor, 10, 0.75));
            return color(i);
        })
        .attr("stroke", "#f0efef")
        .style("stroke-width", "0.5px")
        ;

        node.append("text")
        .text(function (d,i) {
            return dataFoS[i];
        })
        .attr("text-anchor", "middle")
        .style("font-size", function (d,i) {
            return (1/dataFoS[i].length*70)+Math.sqrt(dataNumOnly[i][0].radius)*0.5;
        })
        

    // node.selectAll("label")
    //     .data(function (d, i) {
    //         // console.log("set data")
    //         return pie(d);
    //     })
    //     .enter()
    //     .append('text')
    //     .text(function (d) {
    //         // console.log(d.data.key)
    //         return d.data.key;
    //     })
    //     .attr("transform", function (d) {
    //         return "translate(" + arc.centroid(d) + ")";
    //     })

    //     .attr("text-anchor", "middle")
    //     .style("font-size", 17)

    force.on("tick", function () {
        // link.attr("x1", function (d) { return d.source.x; })
        //     .attr("y1", function (d) { return d.source.y; })
        //     .attr("x2", function (d) { return d.target.x; })
        //     .attr("y2", function (d) { return d.target.y; });

        node.attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")" });
    });
});

