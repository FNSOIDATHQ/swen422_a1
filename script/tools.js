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

function sortValueN(a, b) {
    return b.value - a.value;
}

function sortValueNR(a, b) {
    return a.value - b.value;
}

function CSVreader(path) {
    var k = new Promise(function (resolve, reject) {
        d3.csv(path, function (error, data) {
            data.forEach(function (d) {
                d.date = (d.date);
                d.close = +d.close;
            });
            resolve(data)
        })
    });
    return k;
}