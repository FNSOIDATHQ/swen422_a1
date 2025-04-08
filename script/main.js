//utility parameters

//0=per degree 1=per field of study
var datasetType = 0;
var needSort = false;
//record zoomed chart, only when double clicking it let chart zoom out
var zoomedChart;
//false=zoom out true=zoom in
var ZoomStatus = false;

//UI actions
const sortCheckBox = document.querySelector("#sortDonut");
sortCheckBox.addEventListener("change", () => {
    if (sortCheckBox.checked) {
        needSort = true;
        d3.select("svg").remove();
        drawChart(dataLoaded);

    } else {
        needSort = false;
        d3.select("svg").remove();
        drawChart(dataLoaded);
    }
});

const datasetSelect = document.querySelector("#type");
datasetSelect.addEventListener("change", () => {
    var v = datasetSelect.options[datasetSelect.selectedIndex].value;

    if (v == "FoS") {
        datasetType = 1;
        d3.select("svg").remove();
        drawChart(dataLoaded);
    }
    else if (v == "QT") {
        datasetType = 0;
        d3.select("svg").remove();
        drawChart(dataLoaded);
    }
});

//data importer
var dataLoaded;
CSVreader("./dataset/section1.csv").then(function (data) {
    dataLoaded = data;
    drawChart(dataLoaded);
});

//main drawer function
function drawChart(data) {

    //basic prarmters
    var width = window.innerWidth * 0.98,
        height = 1200,
        baseRadius = 100;
    //FoS=field of study
    var dataFoS = [];
    var dataTotal = [];
    var dataNumOnly = JSON.parse(JSON.stringify(data));

    //parser
    {
        if (datasetType == 0) {
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
                        if (j == "Field of study (Broad)" && data[i][j] != "" && data[i][j] != "Total") {
                            // console.log("find a field")
                            dataFoS.push(data[i][j].substring(0, data[i][j].length - 7))
                        }

                        delete dataNumOnly[i][j]
                    }
                }
            }
        }
        else if (datasetType == 1) {
            dataNumOnly = [];
            var FoSIndex = -1;
            for (var i in data) {
                for (var j in data[i]) {
                    if (j != "Field of study (Broad)" && j != "Field of study (Narrow)") {
                        data[i][j] = +data[i][j];

                        if (j == "Total" && data[i]["Field of study (Narrow)"] != "") {
                            dataNumOnly[FoSIndex][data[i]["Field of study (Narrow)"]] = +data[i][j];
                            // console.log(dataNumOnly[FoSIndex]);
                        }
                    }
                    else {
                        if (j == "Field of study (Broad)" && data[i][j] != "" && data[i][j] != "Total") {
                            // console.log("find a field")
                            dataFoS.push(data[i][j].substring(0, data[i][j].length - 7));
                            dataTotal.push(data[i]["Total"]);
                            FoSIndex++;
                            dataNumOnly[FoSIndex] = []
                        }
                    }
                }
            }
        }

        if (datasetType == 0) {
            var k = 0;
            for (var i in dataNumOnly) {
                // console.log(dataNumOnly[i])
                if (data[i]["Field of study (Broad)"] && data[i]["Field of study (Broad)"] != "Total") {
                    dataNumOnly[i] = d3.entries(dataNumOnly[i])
                    var precent = data[i]["Total"] / 385050 * 12;
                    dataTotal.push(data[i]["Total"]);
                    for (var j in dataNumOnly[i]) {
                        dataNumOnly[i][j].radius = precent * baseRadius + 20;
                        // console.log(dataFoS[k])
                        dataNumOnly[i][j].mainNameSize = (1 / dataFoS[k].length * 70) +
                            Math.sqrt(dataNumOnly[i][0].radius) * 0.5;
                        dataNumOnly[i][j].mainNumSize = Math.sqrt(dataNumOnly[i][0].radius) * 1.25;
                        dataNumOnly[i][j].mainNumTransform = Math.sqrt(dataNumOnly[i][0].radius) * 1.75;
                    }
                    k++;
                }
                else {
                    delete dataNumOnly[i]
                }


            }
        }
        else if (datasetType == 1) {
            var k = 0;
            for (var i in dataNumOnly) {
                // console.log(dataNumOnly[i])
                dataNumOnly[i] = d3.entries(dataNumOnly[i])
                var precent = dataTotal[k] / 385050 * 12;

                for (var j in dataNumOnly[i]) {
                    dataNumOnly[i][j].radius = precent * baseRadius + 20;
                    // console.log(dataFoS[k])
                    dataNumOnly[i][j].mainNameSize = (1 / dataFoS[k].length * 70) +
                        Math.sqrt(dataNumOnly[i][0].radius) * 0.5;
                    dataNumOnly[i][j].mainNumSize = Math.sqrt(dataNumOnly[i][0].radius) * 1.25;
                    dataNumOnly[i][j].mainNumTransform = Math.sqrt(dataNumOnly[i][0].radius) * 1.75;
                }
                k++;


            }
        }

        //delete empty elements
        dataNumOnly = dataNumOnly.filter((item) => {
            return item !== null && typeof item !== "undefined" && item !== "";
        });

        //sort elemtns if needed
        if (needSort == true) {
            for (var i in dataNumOnly) {
                dataNumOnly[i].sort(sortValueN);
            }
        }
    }


    // console.log(dataTotal);
    // console.log(dataNumOnly);

    //draw charts
    var pie = d3.layout.pie()
        .sort(null)
        .value(function (d) { return d.value; })
        ;

    //arcLarge/arcLabel for zoom in view
    var arc = d3.svg.arc()
        .outerRadius(function (d) { return Math.sqrt(d.data.radius) * 5.75; })
        .innerRadius(function (d) { return Math.sqrt(d.data.radius) * 8.25; })
        ;

    var arcLarge = d3.svg.arc()
        .outerRadius(240)
        .innerRadius(300)
        ;

    var arcLabel = d3.svg.arc()
        .innerRadius(390)
        .outerRadius(390)
        ;

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "svgMain")
        ;

    var force = d3.layout.force()
        .charge(function (d) { return -d[0].radius * 16; })
        .size([width, height])
        .nodes(dataNumOnly)
        .start()
        ;

    force.on("tick", function () {
        node.attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")" });
    });

    var node = svg.selectAll(".node")
        .data(dataNumOnly)
        .enter().append("g")
        .attr("class", "node")
        .call(force.drag)
        ;

    var donuts = node.selectAll("path")
        .data(function (d, i) {
            return pie(d);
        })
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", function (d, i) {
            if (i == 0) {
                mainColor = randomColorSequential()
            }
            color = d3.scale.ordinal()
                .domain(d3.range(10))
                .range(rampColor(mainColor, 10, 0.75));
            return color(i);
        })
        .attr("stroke", "#f0efef")
        .style("stroke-width", "0.5px")
        .attr('opacity', '1')
        ;

    // name and total number showed in the center of donuts
    {
        var mainName = node.append("text")
            .text(function (d, i) {
                return dataFoS[i];
            })
            .attr('class', 'mainName')
            .attr("text-anchor", "middle")
            .style("font-size", function (d, i) {
                return dataNumOnly[i][0].mainNameSize;
            })
            .attr("stroke", "#000000")
            .style("stroke-width", "0.2px")
            ;

        node.append("tspan");

        var mainNum = node.append("text")
            .text(function (d, i) {
                return dataTotal[i];
            })
            .attr('class', 'mainNum')
            .attr("text-anchor", "middle")
            .style("font-size", function (d, i) {
                return dataNumOnly[i][0].mainNameSize;
            })
            .attr("stroke", "#000000")
            .style("stroke-width", "0.2px")
            .attr('transform', function (d, i) {
                return "translate(0," + dataNumOnly[i][0].mainNumTransform + ")";
            })
            ;
    }


    //interactions
    donuts
        //show/hide per slice label and hightlight
        .on("mouseover", function (d, i) {
            var donut = d3.select(this);
            donut.transition()
                .duration('50')
                .attr('opacity', '0.5')

            var blockLength = d.data.key.length * 10;
            blockLength = Math.max(blockLength, 80);

            //append to svg is easier
            svg
                // d3.select(this.parentNode)
                .append('rect')
                .attr('x', -blockLength / 2)
                .attr('y', -30)
                .attr('width', blockLength)
                .attr('height', 60)
                .attr('stroke', '#1f1d1d8c')
                .attr('fill', '#9ab8cc8c')
                .attr('transform', function (d) {
                    return "translate(" + (d3.mouse(this)[0] - blockLength * 0.6) + "," + d3.mouse(this)[1] + ")";
                })
                .attr("class", "tempText")
                ;
            svg
                // d3.select(this.parentNode)
                .append("text")
                .attr('class', 'tempText')
                .text(d.data.key)
                .attr('transform', function (d) {
                    return "translate(" + (d3.mouse(this)[0] - blockLength * 0.6) + "," + (d3.mouse(this)[1] + 20) + ")";
                })
                .attr("text-anchor", "middle")
                .style("font-size", 17)
                .attr("stroke", "#000000")
                .style("stroke-width", "1px")
                ;
            svg
                // d3.select(this.parentNode)
                .append("tspan")
                .attr('class', 'tempText')
                ;
            svg
                // d3.select(this.parentNode)
                .append("text")
                .attr('class', 'tempText')
                .text(d.data.value)
                .attr('transform', function (d) {
                    return "translate(" + (d3.mouse(this)[0] - blockLength * 0.6) + "," + d3.mouse(this)[1] + ")";
                })
                .attr("text-anchor", "middle")
                .style("font-size", 17)
                .attr("stroke", "#000000")
                .style("stroke-width", "0.5px")
                ;
        })
        .on('mouseout', function (d, i) {
            d3.select(this.parentNode).selectAll("path").transition()
                .duration('500')
                .attr('opacity', '1')
            d3.selectAll(".tempText").remove()
        })

        //show zoom in view
        .on('dblclick', function (d, i) {
            if (ZoomStatus == false) {
                d3.select(this.parentNode).selectAll("path").transition("zoomIn")
                    .duration('500')
                    .attr("d", arcLarge)
                    ;
                d3.select(this.parentNode).selectAll(".mainName").style("font-size", 30);
                d3.select(this.parentNode).selectAll(".mainNum")
                    .style("font-size", 35)
                    .attr('transform', function (d, i) {
                        return "translate(0," + 50 + ")";
                    })
                    ;

                //view background
                d3.select(this.parentNode)
                    .append('rect')
                    .attr('x', -900)
                    .attr('y', -500)
                    .attr('width', 1800)
                    .attr('height', 1000)
                    .attr('fill', '#c9c9c9e1')
                    .attr("class", "bk")
                    ;
                this.parentNode.insertBefore(d3.select(".bk").node(), this.parentNode.firstChild);

                //labels
                var lastY = 74256;
                var lastSide;
                d3.select(this.parentNode)
                    .selectAll('allPolylines')
                    .data(function (d, i) {
                        return pie(d);
                    })
                    .enter()
                    .append('polyline')
                    .attr("stroke", "gray")
                    .style("fill", "none")
                    .attr("stroke-width", "2px")
                    .attr('points', function (d) {
                        posA = arcLarge.centroid(d);//origin
                        posB = arcLabel.centroid(d);//mid
                        posC = arcLabel.centroid(d);//last

                        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                        const side = midangle < Math.PI ? 1 : -1;
                        posC[0] = 400 * 0.95 * side;

                        //rebuild labels when target slice is too small
                        separate = posB[1];
                        if (lastY != 74256) {
                            //(two neighbour label is too close)||(this label *lower than last one && two labels are in same side)
                            if (Math.abs(posB[1] - lastY) < 16 || ((posB[1] - lastY) * side < 0 && side * lastSide > 0)) {
                                separate = lastY + 15 * side;
                            }
                        }
                        posC[1] = separate;
                        posB[1] = separate;
                        lastY = posB[1];
                        lastSide = side;
                        return [posA, posB, posC]
                    })
                    .attr('class', 'largeLabels')
                    ;

                lastY = 74256;
                d3.select(this.parentNode)
                    .selectAll('allLabels')
                    .data(function (d, i) {
                        return pie(d);
                    })
                    .enter()
                    .append('text')
                    .text(d => d.data.key)
                    .attr('transform', function (d) {
                        const pos = arcLabel.centroid(d);
                        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                        const side = midangle < Math.PI ? 1 : -1;
                        pos[0] = 400 * 0.99 * side;

                        //rebuild labels when target slice is too small
                        separate = pos[1];
                        if (lastY != 74256) {
                            //(two neighbour label is too close)||(this label *lower than last one && two labels are in same side)
                            if (Math.abs(pos[1] - lastY) < 16 || ((pos[1] - lastY) * side < 0 && side * lastSide > 0)) {
                                separate = lastY + 15 * side;
                            }
                        }
                        pos[1] = separate;
                        lastY = pos[1];
                        lastSide = side;
                        return `translate(${pos})`;
                    })
                    .style('text-anchor', function (d) {
                        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                        return (midangle < Math.PI ? 'start' : 'end')
                    })
                    .attr('class', 'largeLabels')
                    ;

                //make target donut show on the top
                this.parentNode.parentNode.appendChild(this.parentNode)

                zoomedChart = this.parentNode;
                ZoomStatus = true;
            }
            else {
                //zoom out only when double clicking zoomed chart
                if (zoomedChart == this.parentNode) {
                    d3.select(this.parentNode).selectAll("path").transition("zoomOut")
                        .duration('500')
                        .attr("d", arc)
                        ;
                    mainName.style("font-size", function (d, i) {
                        return dataNumOnly[i][0].mainNameSize;
                        })
                        ;
                    mainNum.style("font-size", function (d, i) {
                        return dataNumOnly[i][0].mainNumSize;
                        })
                        .attr('transform', function (d, i) {
                            return "translate(0," + dataNumOnly[i][0].mainNumTransform + ")";
                        })
                        ;

                    d3.select(this.parentNode)
                        .selectAll('.largeLabels')
                        .remove();
                    d3.select(this.parentNode)
                        .selectAll('.bk')
                        .remove();

                    ZoomStatus = false;
                }
            }
        })
        ;
}