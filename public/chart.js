
dispatch.on("init", function(){

  var margin,
      svg,
      width, height,
      yScale,
      yAxis,
      chartArea;

  margin = {top: 20, bottom: 40, left: 20, right: 20 };

  height = parseInt(d3.select("#chart").style("height")) - (margin.top + margin.bottom),
  width = height * 1.77777;

  var temperatureStrokeWidth = 3;
  var temperatureThreshold = 5;

  svg = d3.select("#chart").append("svg")
    .attrs({
      "width": function(){ return width + (margin.left + margin.right); },
      "height": function(){ return height + (margin.top + margin.bottom); }
    })
    .append("g")
    .attr("transform", "translate(" + margin.left + ", " + margin.right + ")");

  svg.append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

  chartArea = svg.append("g")
    // .attr("transform", "translate(" + margin.left + ", " + margin.right + ")")
    .attr("clip-path", "url(#clip)");



  yScale = d3.scaleLinear().rangeRound([height, 0]);
  yAxis = d3.axisLeft(yScale);

  svg.append("g").attr("class", "y axis");
  yScale.domain([-20, 20]);
  svg.select(".y.axis")
    .transition()
    .call(yAxis);

  chartArea.append("line")
    .attrs({
      "class": "zeroline",
      "x1": "0",
      "y1": function(){ return yScale(0); },
      "x2": function(){ return width; },
      "y2": function(){ return yScale(0); },
      "stroke": "black"
      // "clip-path": "url(#clip)"
    });

  

  svg.append("clipPath")
    .attr("id", "temperatureClipWarm")
    .append("rect")
    .attr("width", width)
    .attr("height", function(){ return yScale(temperatureThreshold); });

  svg.append("clipPath")
    .attr("id", "temperatureClipCold")
    .append("rect")
    .attr("width", width)
    .attr("height", function(){ return height - yScale(temperatureThreshold); })
    .attr("transform", "translate(0," + yScale(temperatureThreshold) + ")");

  var todaymarker = svg.append("g");
  todaymarker.append("line")
    .attr("class", "zeroline")
    .attr("x1", width / 2)
    .attr("y1", height)
    .attr("x2", width / 2)
    .attr("y2", height - 10)
    .attr("stroke", "black")
    .attr("opacity", 0.2);
  todaymarker.append("line")
    .attr("class", "zeroline")
    .attr("x1", width / 2)
    .attr("y1", 0)
    .attr("x2", width / 2)
    .attr("y2", height - 30)
    .attr("stroke", "black")
    .attr("opacity", 0.2);
  todaymarker.append("text")
    .attr("x", width / 2)
    .attr("y", height - 15)
    .attr("text-anchor", "middle")
    .text("Today");

  dispatch.on("statechange.chart", function(data){
    try{
      data = data["present"].concat(data["past"]);
    }
    catch(err){
      throw err;
      console.log(data);
    }
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

    

    svg.select("#temperatureClipWarm")
      .selectAll("rect")
      .transition()
      .attr("height", function(){ return yScale(temperatureThreshold); });

    svg.select("#temperatureClipCold")
      .selectAll("rect")
      .transition()
      .attr("height", function(){ return height - yScale(temperatureThreshold); })
      .attr("transform", "translate(0," + yScale(temperatureThreshold) + ")");

  });

  var graphPresent = function(){

    var timePeriod = "present";
    var graphWidth = width / 2;

    var xScale = d3.scaleTime().rangeRound([0, graphWidth]);
    var xAxis = d3.axisBottom(xScale);

    var temperatureLine = d3.line()
      .x(function(d) {
        return xScale(d.time);
      })
      .y(function(d) {
        return yScale(d.temperatureMean);
      });

    var g = chartArea.append("g");

    // g.attr("clip-path", "url(#temperatureClip");

    var pathWarm = g.append("path")
      .attr("fill", "none")
      .attr("stroke", "#E2A86D")
      .attr("stroke-width", temperatureStrokeWidth);

    var pathCold = g.append("path")
      .attr("fill", "none")
      .attr("stroke", "#61C0D7")
      .attr("stroke-width", temperatureStrokeWidth);

    svg.append("g").attr("class", "present x axis");

    dispatch.on("statechange.present", function(data){
      var data = data[timePeriod];

      xScale.domain(d3.extent(data, function(d){return d.time;}));

      pathWarm
        .attr("clip-path", "url(#temperatureClipWarm")
        .transition()
        .attr("d", temperatureLine(data));

      pathCold
        .attr("clip-path", "url(#temperatureClipCold)")
        .transition()
        .attr("d", temperatureLine(data));

      svg.select(".present.x.axis")
        .attr("transform", "translate(0, " + height + ")")
        .transition()
        .call(xAxis.ticks(6).tickSizeOuter(0));

    });

  }();

  var graphPast = function(){

    var timePeriod = "past";
    var graphWidth = width / 2;

    var xScale = d3.scaleTime().rangeRound([0, graphWidth]);
    var xAxis = d3.axisBottom(xScale);

    var temperatureLine = d3.line()
      .defined(function(d){
        return d.temperatureMean!=null;
      })
      .x(function(d) {
        return xScale(d.time);
      })
      .y(function(d) {
        return yScale(d.temperatureMean);
      });

    var g = chartArea.append("g")
      .attr("class", "past")
      .attr("transform", "translate(" + graphWidth + ", 0)");

    var pathWarm = g.append("path")
      .attr("fill", "none")
      .attr("opacity", 0.5)
      .attr("stroke", "#E2A86D")
      .attr("stroke-width", temperatureStrokeWidth);

    var pathCold = g.append("path")
      .attr("fill", "none")
      .attr("opacity", 0.5)
      .attr("stroke", "#61C0D7")
      .attr("stroke-width", temperatureStrokeWidth);

    svg.append("g").attr("class", "past x axis");

    dispatch.on("statechange.past", function(data){
      var data = data[timePeriod];

      xScale.domain(d3.extent(data, function(d){return d.time;}));

      pathWarm
        .attr("clip-path", "url(#temperatureClipWarm")
        .transition()
        .attr("d", temperatureLine(data));

      pathCold
        .attr("clip-path", "url(#temperatureClipCold)")
        .transition()
        .attr("d", temperatureLine(data));

      svg.select(".past.x.axis")
        .attr("transform", "translate(" + graphWidth + "," + height + ")")
        .transition()
        .call(xAxis.ticks(6).tickSizeOuter(0));

    });

  }();



});

dispatch.call("init", this);

// dispatch.on("init.present", function(){
//   console.log("initing present");
// });

// var graphPresent = function(){
//   var timePeriod = "present";
//   var graphWidth = width / 2;

//   var xScale = d3.scaleTime().rangeRound([0, graphWidth]);
//   var xAxis = d3.axisBottom(xScale);

//   var g = svg.append("g");
//   g.append("g").attr("class", "present x axis");

//   dispatch.on("statechange.present", function(data){
//     var data = data[timePeriod];

//     xScale.domain(d3.extent(data, function(d){return d.time;}));

//     var bars = g.selectAll(".bar")
//       .data(data, function(d){
//         return d.time;
//       });

//     bars.exit()
//       .transition()
//       .attr("y", yScale(0))
//       .attr("height", height - yScale(0))
//       .remove();

//     bars.enter()
//       .append("rect")
//       .attr("clip-path", "url(#clipHalf)")
//       .attr("class", "bar")
//       .attr("x", function(d) {return xScale(d.time); })
//       .attr("width", 6)
//       .attr("opacity", 0.8)
//       .attr("fill", "steelblue")
//       .attr("y", yScale(0))
//       .attr("height", height - yScale(0))
//       .attr("y", function(d) {return yScale(d.temperatureMean); })
//       .attr("height", function(d){ return height - yScale(d.temperatureMean); });
    
//     bars.transition()
//       .attr("x", function(d){
//         return xScale(d.time);
//       })
//       .attr("y", function(d) {return yScale(d.temperatureMean); })
//       .attr("height", function(d){
//         return height - yScale(d.temperatureMean);
//       });

//     xAxis.scale(xScale);
//     yAxis.scale(yScale);

//     g.select(".present.x.axis")
//       .raise()
//       .attr("transform", "translate(0, " + height + ")")
//       .transition()
//       .call(xAxis.ticks(5));

//   });
// }();

// var graphPast = function(){
//   var timePeriod = "past";
//   var graphWidth = width / 2;
//   var xScale = d3.scaleTime().rangeRound([0, graphWidth]);
//   var xAxis = d3.axisBottom(xScale);

//   var g = svg.append("g");
//   g.attr("transform", "translate(" + graphWidth + ", 0)");
//   g.append("g").attr("class", "past x axis");

//   dispatch.on("statechange.past", function(data){
//     var data = data[timePeriod];

//     xScale.domain(d3.extent(data, function(d){return d.time;}));

//     var bars = g.selectAll(".bar")
//       .data(data, function(d){
//         return d.time;
//       });

//     bars.exit()
//       .transition()
//       .attr("y", yScale(0))
//       .attr("height", height - yScale(0))
//       .remove();

//     bars.enter()
//       .append("rect")
//       .attr("clip-path", "url(#clipHalf)")
//       .attr("class", "bar")
//       .attr("x", function(d) {return xScale(d.time); })
//       .attr("width", 6)
//       .attr("opacity", 0.2)
//       .attr("fill", "steelblue")
//       .attr("y", yScale(0))
//       .attr("height", height - yScale(0))
//       .attr("y", function(d) {return yScale(d.temperatureMean); })
//       .attr("height", function(d){ return height - yScale(d.temperatureMean); });
    
//     bars.transition()
//       .attr("x", function(d){
//         return xScale(d.time);
//       })
//       .attr("y", function(d) {return yScale(d.temperatureMean); })
//       .attr("height", function(d){
//         return height - yScale(d.temperatureMean);
//       });

//     xAxis.scale(xScale);
//     yAxis.scale(yScale);

//     g.select(".past.x.axis")
//       .raise()
//       .attr("transform", "translate(" + 0 + ", " + height + ")")
//       // .attr("transform", "translate(" + graphWidth + ", " + height + ")")
//       .transition()
//       .call(xAxis.ticks(5));



//   });
// }();
