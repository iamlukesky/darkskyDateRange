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

dispatch.on("init.chart", function(){
  svg = "svgen";
  width = 100;
  height = 200;

  dispatch.on("init.past", function(){
  });

  dispatch.on("init.present", function(){
  });

});


dispatch.on("init.bar", function(){

  var timePeriod = "past";

  var margin = {
    top: 20,
    bottom: 20,
    left: 20,
    right: 20
  };


  var height = parseInt(d3.select("#chart").style("height")) - (margin.top + margin.bottom),
      width = height * 1.77777;

  var svg = d3.select("#chart").append("svg")
    .attr("width", width + (margin.left + margin.right))
    .attr("height", height + (margin.top + margin.bottom))
    .append("g")
      .attr("transform", "translate(" + margin.left + ", " + margin.right + ")");

  var xScale = d3.scaleTime()
    .rangeRound([0, width]);
  var yScale = d3.scaleLinear().rangeRound([height, 0]);

  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);

  svg.append("g")
    .attr("class", "x axis");
  svg.append("g")
    .attr("class", "y axis");

  dispatch.on("statechange.bar", function(data){
    var data = data[timePeriod];
    data.forEach(function(d){
      d.temperatureMean = parseFloat(d.temperatureMean);
    });

    xScale.domain(d3.extent(data, function(d){return d.time;}));
    var yExtent = d3.extent(data, function(d){return d.temperatureMean;});
    yScale.domain([yExtent[0] - 5, yExtent[1] + 5]);

    var bars = svg.selectAll(".bar")
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
        .attr("class", "bar")
        .attr("x", function(d) {return xScale(d.time); })
        .attr("width", 18)
        .attr("opacity", 0.8)
        .attr("fill", "OliveDrab")
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

    d3.select(".x.axis")
      .attr("transform", "translate(0, " + height + ")")
      .transition()
      .call(xAxis.ticks(5));

    d3.select(".y.axis")
      .transition()
      .call(yAxis);

  });
    
});

dispatch.call("init", this);