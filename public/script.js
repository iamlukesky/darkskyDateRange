// marker styles
var circleWaiting = {
  color: "red",
  fillColor: "red",
  fillOpacity: 0.5,
  opacity: 0.5,
  radius: 7
};

var circleNormal = {
  color: "green",
  fillColor: "green",
  fillOpacity: 0.5,
  opacity: 0.5,
  radius: 5
}

// set up map
var sthlm = [59.311162, 18.074806];
var map = L.map('map');
L.tileLayer.provider('OpenStreetMap.BlackAndWhite').addTo(map);
map.setView(sthlm, 13);

map.on('click', onMapClick);

var dateRanges = getRanges(1);
var parseDate = d3.isoParse;

var circle = L.circleMarker(sthlm, circleWaiting).addTo(map);
getNewData(sthlm[0], sthlm[1], dateRanges);

function onMapClick(e){
  circle.setLatLng(e.latlng);
  circle.setStyle(circleWaiting);
  getNewData(e.latlng.lat, e.latlng.lng, dateRanges);
}

function getRanges(months){
  var thisYear = { "start": new Date(), "end": new Date(), "key": "present" };
  thisYear.end.setHours(0, 0, 0, 0);
  thisYear.start = new Date(thisYear.end);
  thisYear.start.setMonth(thisYear.start.getMonth() - months); // today - 3 monhts
  var lastYear = { "start": new Date(thisYear.end), "end": new Date(), "key": "past" };
  lastYear.start.setYear(lastYear.start.getFullYear() - 1); // today - 1 year
  lastYear.end = new Date(lastYear.start);
  lastYear.end.setMonth(lastYear.end.getMonth() + months); // (today - 1 yeary) + 3 months

  return [thisYear, lastYear];
}

function getNewData(lat, lng, dates){
  var callsRemaining = dates.length;
  var data = {};

  dates.forEach(function(range){
    var url = buildUrl(lat, lng, range);
    console.log(window.location.href + url);
    d3.json(url, handleResponse);
  })

  function buildUrl(lat, lng, range){
    return "/darkskySeason?lat=" + lat
      + "&lng=" + lng
      + "&startDate=" + range.start
      + "&endDate=" + range.end;
  }

  function handleResponse(err, json){
    var key;

    json.data.forEach(function(d){
      d.time = parseDate(d.time * 1000);
      d.temperatureMean = parseFloat(d.temperatureMean);
    })

    dates.forEach(function(e){
      var i = Math.floor(json.data.length / 2);
      if((json.data[i].time >= e.start) && (json.data[i].time <= e.end)){
        key = e.key;
      }
    });

    data[key] = json.data;

    callsRemaining--;
    if(callsRemaining <= 0){
      done(data);
    }
  }

  function done(data){
    circle.setStyle(circleNormal);            
    console.log(data);
    console.log("changing state");
    dispatch.call("statechange", this, data);
  }
}

var dispatch = d3.dispatch("init", "load", "statechange", "resize");

var chart = function(){

  var margin,
      svg,
      width, height,
      yScale,
      yAxis;

  margin = {top: 20, bottom: 20, left: 20, right: 20 };

  height = parseInt(d3.select("#chart").style("height")) - (margin.top + margin.bottom),
  width = height * 1.77777;

  svg = d3.select("#chart").append("svg")
    .attrs({
      "width": function(){ return width + (margin.left + margin.right); },
      "height": function(){ return height + (margin.top + margin.bottom); }
    })
    .append("g")
    .attr("transform", "translate(" + margin.left + ", " + margin.right + ")");

  yScale = d3.scaleLinear().rangeRound([height, 0]);
  yAxis = d3.axisLeft(yScale);

  svg.append("g").attr("class", "y axis");
  yScale.domain([-20, 20]);
  svg.select(".y.axis")
    .transition()
    .call(yAxis);

  svg.append("clipPath")
    .attr("id", "clipHalf")
    .append("rect")
    .attr("width", width / 2)
    .attr("height", height);
  svg.append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

  svg.append("line")
    .attrs({
      "class": "zeroline",
      "x1": "0",
      "y1": function(){ return yScale(0); },
      "x2": function(){ return width; },
      "y2": function(){ return yScale(0); },
      "stroke": "black",
      "clip-path": "url(#clip)"
    })

  dispatch.on("statechange.chart", function(data){
    data = data["past"].concat(data["present"]);
    console.log(data);
    var yExtent = d3.extent(data, function(d){return d.temperatureMean;});
    yScale.domain([yExtent[0] - 5, yExtent[1] + 5]);
    svg.select(".y.axis")
      .raise()
      .transition()
      .call(yAxis);

    svg.select(".zeroline")
      .raise()
      .transition()
      .attrs({
        "y1": function(){ return yScale(0); },
        "y2": function(){ return yScale(0); }
      });
  });

  var graphPresent = function(){
    var timePeriod = "present";
    var graphWidth = width / 2;

    var xScale = d3.scaleTime().rangeRound([0, graphWidth]);
    var xAxis = d3.axisBottom(xScale);

    var g = svg.append("g");
    g.append("g").attr("class", "present x axis");

    dispatch.on("statechange.present", function(data){
      var data = data[timePeriod];

      xScale.domain(d3.extent(data, function(d){return d.time;}));

      var bars = g.selectAll(".bar")
        .data(data, function(d){
          return d.time;
        });

      bars.exit()
        .transition()
        .attr("y", yScale(0))
        .attr("height", height - yScale(0))
        .remove();

      bars.enter()
        .append("rect")
        .attr("clip-path", "url(#clipHalf)")
        .attr("class", "bar")
        .attr("x", function(d) {return xScale(d.time); })
        .attr("width", 6)
        .attr("opacity", 0.8)
        .attr("fill", "steelblue")
        .attr("y", yScale(0))
        .attr("height", height - yScale(0))
        .attr("y", function(d) {return yScale(d.temperatureMean); })
        .attr("height", function(d){ return height - yScale(d.temperatureMean); });
      
      bars.transition()
        .attr("x", function(d){
          return xScale(d.time);
        })
        .attr("y", function(d) {return yScale(d.temperatureMean); })
        .attr("height", function(d){
          return height - yScale(d.temperatureMean);
        });

      xAxis.scale(xScale);
      yAxis.scale(yScale);

      g.select(".present.x.axis")
        .raise()
        .attr("transform", "translate(0, " + height + ")")
        .transition()
        .call(xAxis.ticks(5));

    });
  }();

  var graphPast = function(){
    var timePeriod = "past";
    var graphWidth = width / 2;
    var xScale = d3.scaleTime().rangeRound([0, graphWidth]);
    var xAxis = d3.axisBottom(xScale);

    var g = svg.append("g");
    g.attr("transform", "translate(" + graphWidth + ", 0)");
    g.append("g").attr("class", "past x axis");

    dispatch.on("statechange.past", function(data){
      var data = data[timePeriod];

      xScale.domain(d3.extent(data, function(d){return d.time;}));

      var bars = g.selectAll(".bar")
        .data(data, function(d){
          return d.time;
        });

      bars.exit()
        .transition()
        .attr("y", yScale(0))
        .attr("height", height - yScale(0))
        .remove();

      bars.enter()
        .append("rect")
        .attr("clip-path", "url(#clipHalf)")
        .attr("class", "bar")
        .attr("x", function(d) {return xScale(d.time); })
        .attr("width", 6)
        .attr("opacity", 0.2)
        .attr("fill", "steelblue")
        .attr("y", yScale(0))
        .attr("height", height - yScale(0))
        .attr("y", function(d) {return yScale(d.temperatureMean); })
        .attr("height", function(d){ return height - yScale(d.temperatureMean); });
      
      bars.transition()
        .attr("x", function(d){
          return xScale(d.time);
        })
        .attr("y", function(d) {return yScale(d.temperatureMean); })
        .attr("height", function(d){
          return height - yScale(d.temperatureMean);
        });

      xAxis.scale(xScale);
      yAxis.scale(yScale);

      g.select(".past.x.axis")
        .raise()
        .attr("transform", "translate(" + 0 + ", " + height + ")")
        // .attr("transform", "translate(" + graphWidth + ", " + height + ")")
        .transition()
        .call(xAxis.ticks(5));



    });
  }();

}();




// dispatch.call("init", this);