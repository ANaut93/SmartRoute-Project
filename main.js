var graphmap, svg, maps, g;

var mapdata = {
    allnodes: [],
    paths: [],
    distances: [],
    getui: {
        htmlSelectStartingNode: "#from-starting",
        htmlSelectEndNode: "#to-end"
    },
    getstate: {
        selectedNode: null,
        fromNode: null,
        toNode: null
    }
};

maps = L.map('svg-map').setView([28.6139, 77.2090], 14); 
mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; ' + mapLink + ' Contributors', maxZoom: 18,
}).addTo(maps);
maps._initPathRoot()
svg = d3.select("#svg-map").select("svg")
    .attr("class", "svgmap")
    .on("contextmenu", function () { d3.event.preventDefault(); })

maps.on("viewreset", redrawmapwhenviewchanges);

function redrawmapwhenviewchanges() {
    redrawNodes();
    redrawLines();
}

maps.on('click', function (e) {
    var nodeName = mapdata.allnodes.length;
    console.log(e.latlng.lat + ", " + e.latlng.lng);

    mapdata.allnodes.push({
        name: nodeName, x: e.latlng.lat, y: e.latlng.lng
    });
    redrawNodes();
    addNodeToSelect(nodeName);
});

function dragNode() {
    return function (d, i) {
        var d = d;
        var golf = true;
        maps.on('mousemove', function (e) {
            if (golf == true) {
                var nodeDatum = {
                    name: d.name,
                    x: e.latlng.lat,
                    y: e.latlng.lng
                };
                mapdata.allnodes[i] = nodeDatum;
                calculateDistancesbetweennodes();
                redrawLines();
                redrawNodes();
            } else {
                return
            }
        });
        maps.on('mouseup', function (e) {
            golf = false;
            return
        });
    }
};

function redrawNodes() {
    svg.selectAll("g.nodes").data([]).exit().remove();
    var elements = svg.selectAll("g.nodes").data(mapdata.allnodes, function (d, i) { return d.name; });
    var nodesEnter = elements.enter().append("g")
        .attr("class", "nodes");

    elements.attr("transform", function (d, i) {
        return "translate(" +
            maps.latLngToLayerPoint(new L.LatLng(d.x, d.y)).x + "," +
            maps.latLngToLayerPoint(new L.LatLng(d.x, d.y)).y + ")";
    });

    nodesEnter.append("circle")
        .attr("nodeId", function (d, i) { return i; })
        .attr("r", '24')
        .attr("class", "node")
        .style("cursor", "pointer")
        .on('click', nodeClick)
        .on("mouseenter", function () { maps.dragging.disable(); })
        .on("mouseout", function () { maps.dragging.enable(); })
        .on('contextmenu', function (d, i) { startEndPath(i); })
        .call(dragManager)

    nodesEnter
        .append("text")
        .attr("nodeLabelId", function (d, i) { return i; })
        .attr("dx", "-5")
        .attr("dy", "5")
        .attr("class", "label")
        .on('contextmenu', function (d, i) { startEndPath(i); })
        .call(dragManager)
        .text(function (d, i) { return d.name });

    elements.exit().remove();
};

function redrawLines() {
    svg.selectAll("g.line").data([]).exit().remove();
    var elements = svg
        .selectAll("g.line")
        .data(mapdata.paths, function (d) { return d.id });

    var newElements = elements.enter();

    var group = newElements
        .append("g")
        .attr("class", "line");

    var line = group.append("line")
        .attr("class", function (d) {
            return "from" + mapdata.allnodes[d.from].name + "to" + mapdata.allnodes[d.to].name
        })
        .attr("x1", function (d) { return maps.latLngToLayerPoint(new L.LatLng(mapdata.allnodes[d.from].x, mapdata.allnodes[d.from].y)).x; })
        .attr("y1", function (d) { return maps.latLngToLayerPoint(new L.LatLng(mapdata.allnodes[d.from].x, mapdata.allnodes[d.from].y)).y; })
        .attr("x2", function (d) { return maps.latLngToLayerPoint(new L.LatLng(mapdata.allnodes[d.to].x, mapdata.allnodes[d.to].y)).x; })
        .attr("y2", function (d) { return maps.latLngToLayerPoint(new L.LatLng(mapdata.allnodes[d.to].x, mapdata.allnodes[d.to].y)).y; });

    var text = group.append("text")
        .attr("x", function (d) { return parseInt((maps.latLngToLayerPoint(new L.LatLng(mapdata.allnodes[d.from].x, mapdata.allnodes[d.from].y)).x + maps.latLngToLayerPoint(new L.LatLng(mapdata.allnodes[d.to].x, mapdata.allnodes[d.to].y)).x) / 2) + 5; })
        .attr("y", function (d) { return parseInt((maps.latLngToLayerPoint(new L.LatLng(mapdata.allnodes[d.from].x, mapdata.allnodes[d.from].y)).y + maps.latLngToLayerPoint(new L.LatLng(mapdata.allnodes[d.to].x, mapdata.allnodes[d.to].y)).y) / 2) - 5; })
        .attr("class", "line-label");

    elements.selectAll("text")
        .text(function (d) {
            return Math.round(mapdata.distances[d.from][d.to]) + " m";
        });
    elements.exit().remove();
};

function LatLon(lat, lon) {
    this.lat = Number(lat);
    this.lon = Number(lon);
}

LatLon.prototype.distanceTo = function (point, radius) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');
    radius = (radius === undefined) ? 6378137 : Number(radius);
    if (Number.prototype.toRadians === undefined) {
        Number.prototype.toRadians = function () { return this * Math.PI / 180; };
    }
    if (Number.prototype.toDegrees === undefined) {
        Number.prototype.toDegrees = function () { return this * 180 / Math.PI; };
    }
    var R = radius;
    var φ1 = this.lat.toRadians(), λ1 = this.lon.toRadians();
    var φ2 = point.lat.toRadians(), λ2 = point.lon.toRadians();
    var Δφ = φ2 - φ1;
    var Δλ = λ2 - λ1;
    var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2)
        + Math.cos(φ1) * Math.cos(φ2)
        * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
};

var dragManager = d3.behavior.drag()
    .on('dragstart', dragNodeStart())
    .on('drag', dragNode())
    .on('dragend', dragNodeEnd());

$('#setexample').on('change', function () {
    var value = $(this).val();
    var filePath = "";
    var viewLat, viewLng, viewZoom;

    if (value == 1) {
        filePath = "nodesandpaths1.json";
        viewLat = 41.005901; viewLng = 28.975421; viewZoom = 18;
    } else if (value == 2) {
        filePath = "nodesandpaths2.json";
        viewLat = 40.737; viewLng = -73.923; viewZoom = 18;
    } else if (value == 3) {
        filePath = "delhi_map.json";
        viewLat = 28.6129; viewLng = 77.2295; viewZoom = 16;
    } else {
        return; 
    }

    clearGraph();
    maps.setView(new L.LatLng(viewLat, viewLng), viewZoom);
    $.getJSON(filePath, function (datad) {
        var importedData = datad;
        if (importedData.nodes === undefined || importedData.paths === undefined) {
            console.log("** JSON format error:", importedData);
            return;
        }
        mapdata.allnodes = importedData.nodes;
        mapdata.paths = importedData.paths;
        mapdata.allnodes.forEach(function (node) {
            addNodeToSelect(node.name);
        });
        calculateDistancesbetweennodes();
        redrawLines();
        redrawNodes();
    });
});

$("#data-export").click(function (e) {
    e.stopPropagation()
    var exportData = JSON.stringify({
        nodes: mapdata.allnodes,
        paths: mapdata.paths
    });
    var target = $(this);
    var link = $("<a></a>")
        .addClass("exportLink")
        .click(function (e) { e.stopPropagation(); })
        .attr('target', '_self')
        .attr("download", "nodesandpaths.json")
        .attr("href", "data:application/json," + exportData)
    link.appendTo(target).get(0).click();
    $(".exportLink").remove();
});

$("#getmethere").on('click',function () {
    var valuelat = $("#latitude").val();
    var valuelong = $("#longitude").val();
    if (valuelat == '' || valuelong == '' ){
      alert("Please Enter Latitude and Longitude.");  
    } else {
        maps.setView(new L.LatLng(valuelat, valuelong), 15);
    }
});

$("#data-import").change(function (e) {
    e.stopPropagation();
    var files = e.target.files;
    var file = files[0];
    if (file === undefined) return;
    var reader = new FileReader();
    reader.onload = function () {
        try {
            var importedData = JSON.parse(this.result);
        }
        catch (exception) {
            console.log("** Error importing JSON: %s", exception);
            return;
        }
        if (importedData.nodes === undefined || importedData.paths === undefined) {
            console.log("** JSON format error:", importedData);
            return;
        }
        mapdata.allnodes = importedData.nodes;
        mapdata.paths = importedData.paths;
        mapdata.allnodes.forEach(function (node) {
            addNodeToSelect(node.name);
        });
        calculateDistancesbetweennodes();
        redrawLines();
        redrawNodes();
    }
    reader.readAsText(file);
});

$('#getshortestroute').on('click', function () {
    d3.selectAll("line").classed({ "shortest": false });
    $('#results-card').hide();
    calculateDistancesbetweennodes();
    if (!$(mapdata.getui.htmlSelectStartingNode).val() || !$(mapdata.getui.htmlSelectEndNode).val()) return;
    
    var sourceNodeId = $(mapdata.getui.htmlSelectStartingNode).val();
    var targetNodeId = $(mapdata.getui.htmlSelectEndNode).val();
    
    var results = dijkstra(sourceNodeId, targetNodeId);
    
    if (results.path) {
        results.path.forEach(function (step) {
            var stepLine = d3.select(
                "line.from" + step.source + "to" + step.target + ","
                + "line.from" + step.target + "to" + step.source
            );
            stepLine.classed({ "shortest": true });
        });

        
        var sourceNode = mapdata.allnodes[sourceNodeId];
        var targetNode = mapdata.allnodes[targetNodeId];
        var p1 = new LatLon(sourceNode.x, sourceNode.y);
        var p2 = new LatLon(targetNode.x, targetNode.y);
        var directDistance = p1.distanceTo(p2);

       
        var pathDistanceKm = (results.distance / 1000).toFixed(2);
        var directDistanceKm = (directDistance / 1000).toFixed(2);
        var differenceKm = (results.distance - directDistance)/1000;
        


var speeds = {
    walking: 5,     
    bicycle: 15,    
    bike: 30,       
    car: 40         
};

var timeWalking = calculateTravelTime(results.distance, speeds.walking);
var timeBicycle = calculateTravelTime(results.distance, speeds.bicycle);
var timeBike = calculateTravelTime(results.distance, speeds.bike);
var timeCar = calculateTravelTime(results.distance, speeds.car);

var resultsHtml = `
    <h5 class="card-title">Route Calculation Complete</h5>
    <div class="row">
        <div class="col-md-6">
            <p><strong>Shortest Path Distance:</strong><br><span class="text-success font-weight-bold h4">${pathDistanceKm} km</span></p>
        </div>
        <div class="col-md-6">
            <p><strong>Direct 'As-the-crow-flies' Distance:</strong><br><span class="h5">${directDistanceKm} km</span></p>
        </div>
    </div>
    <p class="mb-0 text-muted small">By following the created paths, the route is <strong>${differenceKm.toFixed(2)} km</strong> longer than a straight line.</p>
    <hr>
    <h5 class="card-title mt-4">Estimated Travel Times</h5>
    <div class="row text-center">
        <div class="col-6 col-md-3 mb-2">
            <p class="mb-1"><i class="fas fa-walking fa-2x text-info"></i></p>
            <span class="font-weight-bold d-block">${timeWalking}</span>
            <small class="text-muted">Walking</small>
        </div>
        <div class="col-6 col-md-3 mb-2">
            <p class="mb-1"><i class="fas fa-biking fa-2x text-success"></i></p>
            <span class="font-weight-bold d-block">${timeBicycle}</span>
            <small class="text-muted">Bicycle</small>
        </div>
        <div class="col-6 col-md-3 mb-2">
            <p class="mb-1"><i class="fas fa-motorcycle fa-2x text-warning"></i></p>
            <span class="font-weight-bold d-block">${timeBike}</span>
            <small class="text-muted">Bike/Scooter</small>
        </div>
        <div class="col-6 col-md-3 mb-2">
            <p class="mb-1"><i class="fas fa-car fa-2x text-danger"></i></p>
            <span class="font-weight-bold d-block">${timeCar}</span>
            <small class="text-muted">Car</small>
        </div>
    </div>
`;
$('#results-text').html(resultsHtml);
$('#results-card').fadeIn();


    } else {
        var errorHtml = `
             <h5 class="card-title text-danger">No Route Found</h5>
             <p>A path could not be found between the selected nodes. Please ensure they are connected within the same network.</p>
        `;
        $('#results-text').html(errorHtml);
        $('#results-card').fadeIn();
    }
});

$('#clearmap').on('click', function () {
    clearGraph();
});

function addNodeToSelect(nodeName) {
    $(mapdata.getui.htmlSelectStartingNode).append($("<option></option>").attr("value", nodeName).text(nodeName));
    $(mapdata.getui.htmlSelectEndNode).append($("<option></option>").attr("value", nodeName).text(nodeName));
};

function clearGraph() {
    mapdata.allnodes = [];
    mapdata.paths = [];
    $(mapdata.getui.htmlSelectStartingNode).empty().append('<option value="0">Select...</option>');
    $(mapdata.getui.htmlSelectEndNode).empty().append('<option value="0">Select...</option>');
    $('#results-card').hide();
    redrawNodes();
    redrawLines();
};

function nodeClick(d, i) {
    d3.event.preventDefault();
    d3.event.stopPropagation();
};

function dragNodeStart() {
    return function (d, i) {};
};

function dragNodeEnd() {
    return function (d, i) {};
};

function killEvent() {
    if (d3.event.preventDefault) {
        d3.event.preventDefault();
        d3.event.stopPropagation();
    }
};

function startEndPath(index) {
    d3.event.stopPropagation();
    d3.event.preventDefault();
    if (mapdata.getstate.fromNode === null) {
        mapdata.getstate.fromNode = index;
    }
    else {
        if (mapdata.getstate.fromNode === index) {
            return;
        }
        mapdata.getstate.toNode = index;
        var pathDatum = {
            id: mapdata.paths.length,
            from: mapdata.getstate.fromNode,
            to: index
        };
        mapdata.paths.push(pathDatum);
        calculateDistancesbetweennodes();
        redrawLines();
        redrawNodes();
        mapdata.getstate.fromNode = null;
        mapdata.getstate.toNode = null;
    }
};

function calculateDistancesbetweennodes() {
    mapdata.distances = [];
    for (var i = 0; i < mapdata.allnodes.length; i++) {
        mapdata.distances[i] = [];
        for (var j = 0; j < mapdata.allnodes.length; j++)
            mapdata.distances[i][j] = 'x';
    }
    for (var i = 0; i < mapdata.paths.length; i++) {
        var sourceNodeId = parseInt(mapdata.paths[i].from);
        var targetNodeId = parseInt(mapdata.paths[i].to);
        var sourceNode = mapdata.allnodes[sourceNodeId];
        var targetNode = mapdata.allnodes[targetNodeId];
        var p1 = new LatLon(sourceNode.x, sourceNode.y);
        var p2 = new LatLon(targetNode.x, targetNode.y);
        var d = p1.distanceTo(p2);
        mapdata.distances[sourceNodeId][targetNodeId] = d;
        mapdata.distances[targetNodeId][sourceNodeId] = d;
    };
};




function calculateTravelTime(distanceMeters, speedKmh) {
    if (distanceMeters === 0 || speedKmh <= 0) {
        return "0 minutes";
    }

    const distanceKm = distanceMeters / 1000;
    const timeHours = distanceKm / speedKmh;
    const totalMinutes = Math.round(timeHours * 60);

    if (totalMinutes < 1) {
        return "< 1 minute";
    }
    if (totalMinutes < 60) {
        return totalMinutes + " minute" + (totalMinutes > 1 ? "s" : "");
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (minutes === 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
    }

    return `${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''}`;
}


 function dijkstra(start, end) {
    var nodeCount = mapdata.distances.length,
        infinity = 9999999, 
        shortestPath = new Array(nodeCount),
        nodeChecked = new Array(nodeCount),
        pred = new Array(nodeCount);

    for (var i = 0; i < nodeCount; i++) {
        shortestPath[i] = infinity;
        pred[i] = null;
        nodeChecked[i] = false;
    }

    shortestPath[start] = 0;

    for (var i = 0; i < nodeCount; i++) {
        var minDist = infinity;
        var closestNode = null;

        for (var j = 0; j < nodeCount; j++) {
            if (!nodeChecked[j]) {
                if (shortestPath[j] <= minDist) {
                    minDist = shortestPath[j];
                    closestNode = j;
                }
            }
        }
        
        if (closestNode === null) break; 

        nodeChecked[closestNode] = true;

        for (var k = 0; k < nodeCount; k++) {
            if (!nodeChecked[k]) {
                var nextDistance = distanceBetween(closestNode, k, mapdata.distances);
                if ((parseInt(shortestPath[closestNode]) + parseInt(nextDistance)) < parseInt(shortestPath[k])) {
                    soFar = parseInt(shortestPath[closestNode]);
                    extra = parseInt(nextDistance);
                    shortestPath[k] = soFar + extra;
                    pred[k] = closestNode;
                }
            }
        }
    }

    if (shortestPath[end] < infinity) {
        var newPath = [];
        var step = {
            target: parseInt(end)
        };
        var v = parseInt(end);

        while (v >= 0 && v !== null && pred[v] !== null) {
            step.source = pred[v];
            newPath.unshift(step);
            step = {
                target: pred[v]
            };
            v = pred[v];
        }
        
       
        if(start == end) {
             return { mesg: 'Status: OK', path: [], source: start, target: end, distance: 0 };
        }

        totalDistance = shortestPath[end];

        return {
            mesg: 'Status: OK',
            path: newPath,
            source: start,
            target: end,
            distance: totalDistance
        };
    } else {
        return {
            mesg: 'Sorry No path found',
            path: null,
            source: start,
            target: end,
            distance: 0
        };
    }

    function distanceBetween(fromNode, toNode, distances) {
        dist = distances[fromNode][toNode];
        if (dist === 'x') dist = infinity;
        return dist;
    }
};

