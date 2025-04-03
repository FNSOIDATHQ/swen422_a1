function rampColor(color, n, start = 0) {
  var out = new Array();

  for (var i = 0; i < n; i++) {
      out[i] = color((i + start) / (n - 1));
  }
  return out;
}

function randomColorSequential() {
  var select = Math.floor(Math.random() * 21);
  // console.log("select=" + select);
  switch (select) {
      case 0:
          return d3.interpolate("White", "Salmon");
      case 1:
          return d3.interpolate("White", "#3498db");
      case 2:
          return d3.interpolate("White", "#7734db");
      case 3:
          return d3.interpolate("White", "#3445db");
      case 4:
          return d3.interpolate("White", "#cb34db");
      case 5:
          return d3.interpolate("White", "#db3498");
      case 6:
          return d3.interpolate("White", "#db3445");
      case 7:
          return d3.interpolate("White", "#618685");
      case 8:
          return d3.interpolate("White", "#50394c");
      case 9:
          return d3.interpolate("White", "#eea29a");
      case 10:
          return d3.interpolate("White", "#c94c4c");
      case 11:
          return d3.interpolate("White", "#667292");
      case 12:
          return d3.interpolate("White", "#80ced6");
      case 13:
          return d3.interpolate("White", "#ffcc5c");
      case 14:
          return d3.interpolate("White", "#4040a1");
      case 15:
          return d3.interpolate("White", "#f7786b");
      case 16:
          return d3.interpolate("White", "#87bdd8");
      case 17:
          return d3.interpolate("White", "#e06377");
      case 18:
          return d3.interpolate("White", "#622569");
      case 19:
          return d3.interpolate("White", "#588c7e");
      case 20:
          return d3.interpolate("White", "#f2ae72");
      default:
          return d3.interpolate("White", "White");
  }
}

function sortN(a, b) {
  return b[1] - a[1];
}

function sortNR(a, b) {
  return a[1] - b[1];
}

//data importer

var temp = d3.csv("/dataset/section1.csv");

const drawChart = async () => {
  const dataset = await temp;

  //parser
  for (var i in dataset) {
    for (var j in dataset[i]) {
      if (j != "Field of study (Broad)" && j != "Field of study (Narrow)") {
        dataset[i][j] = +dataset[i][j];
      }
    }
  }

  // console.log(dataset);
  var data = {a: 9, b: 20, c:30, d:8, e:12};
  for (var i in dataset) {
    if (dataset[i]["Field of study (Broad)"] && dataset[i]["Field of study (Broad)"] != "Total") {
      drawDonut(dataset[i])
    }
  }

  // set the dimensions and margins of the graph
  const width = 900
  const height = 900

  // append the svg object to the body of the page
  const svg = d3.select("#testDonut")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width/2}, ${height/2})`);

    var radius = 70;
  const arc = d3.arc()
    .innerRadius(radius * 0.5)         // This is the size of the donut hole
    .outerRadius(radius * 0.8)
  // Initialize the circle: all located at the center of the svg area

  const pie = d3.pie()
    .sort(null)
    .value(d => d[1])
  var dataPied=pie(Object.entries(data))
  const node = svg
    .selectAll('allSlices')
    .data(dataPied)
    .join('path')
    .attr('d', arc)
    .attr('fill', "#69b3a2")
    .style("opacity", 0.7)

  // Features of the forces applied to the nodes:
  const simulation = d3.forceSimulation()
    .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
    .force("charge", d3.forceManyBody().strength(0.5)) // Nodes are attracted one each other of value is > 0
    .force("collide", d3.forceCollide().strength(.01).radius(30).iterations(1)) // Force that avoids circle overlapping

  // Apply these forces to the nodes and update their positions.
  // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
  simulation
    .nodes(data)
    .on("tick", function (d) {
      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
    });
};

drawChart();




function drawDonut(dataset) {
  var WHMax = 190;
  var precent = dataset["Total"] / 385050 * 13;
  var width = precent * WHMax;
  var height = precent * WHMax;

  var radius = precent * 70;

  const svg = d3.select("#testDonut")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);


  var data = dataset
  delete data["Field of study (Broad)"]
  delete data["Field of study (Narrow)"]
  // console.log("before="+Object.keys(data).length)
  for (var i in data) {
    if (data[i] == 0 || i == "Total") {
      delete data[i]
    }
  }
  // console.log("after="+Object.keys(data).length)

  var dataArray = Object.entries(data);
  dataArray.sort(sortN);

  var mainColor = randomColorSequential();
  var size = Object.keys(data).length
  const color = d3.scaleOrdinal()
    .domain(dataArray)
    .range(rampColor(mainColor, size, 0.75));


  const pie = d3.pie()
    .sort(null)
    .value(d => d[1])
  const data_ready = pie(dataArray)

  const arc = d3.arc()
    .innerRadius(radius * 0.5)         // This is the size of the donut hole
    .outerRadius(radius * 0.8)

  // Another arc that won't be drawn. Just for labels positioning
  const outerArc = d3.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9)

  // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
  svg
    .selectAll('allSlices')
    .data(data_ready)
    .join('path')
    .attr('d', arc)
    .attr('fill', d => color(d.data[0]))
    .attr("stroke", mainColor(0.25))
    .style("stroke-width", (precent * 0.5).toString() + "px")
    .style("opacity", 0.7)


  // Add the polylines between chart and labels:
  svg
    .selectAll('allPolylines')
    .data(data_ready)
    .join('polyline')
    .attr("stroke", "blue")
    .style("fill", "none")
    .attr("stroke-width", 1)
    .attr('points', function (d) {
      const posA = arc.centroid(d) // line insertion in the slice
      const posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
      const posC = outerArc.centroid(d); // Label position = almost the same as posB
      const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
      posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
      return [posA, posB, posC]
    })

  // Add the polylines between chart and labels:
  svg
    .selectAll('allLabels')
    .data(data_ready)
    .join('text')
    .text(d => d.data[0])
    .attr('transform', function (d) {
      const pos = outerArc.centroid(d);
      const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
      pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
      return `translate(${pos})`;
    })
    .style('text-anchor', function (d) {
      const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
      return (midangle < Math.PI ? 'start' : 'end')
    })

  return svg
}
