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

var dispatch = d3.dispatch("init", "load", "statechange", "resize");


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
    // console.log(data);
    // console.log("changing state");
    dispatch.call("statechange", this, data);
  }
}

