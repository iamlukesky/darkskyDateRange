require('dotenv').config();
var express = require('express');  
var darkskyDateRange = require("./darksky-daterange.js");
var darkskyForecast = require("./darksky-forecast.js");

var app = express();
app.listen(process.env.PORT || 3000);

var weatherErrorMsg = "Something went wrong getting the weatherdata";

app.use(express.static('public'));

app.use('/darkskySeason', function(req, res){
  var latlng = getLatLng(req);
  var startDate = new Date(req.query.startDate);
  var endDate = new Date(req.query.endDate);

  darkskyDateRange.getDataForRange(latlng, startDate, endDate, function(err, result){
    if (err) {
      res.status(400).send("Couldn't get weatherdata");
      return console.error(weatherErrorMsg, err);
    }
    else{
      res.json(result);
    }
  });
});

app.use('/darkskyForecast', function(req, res){
  var latlng = getLatLng(req);

  darkskyForecast.getForecast(latlng, function(err, forecast){
    if(err){
      res.status(400).send("Couldn't get weatherdata");
      return console.error(weatherErrorMsg, err);
    }
    else{
      res.json(forecast);
    }
  })
});

function getLatLng(req){
  return {lat: req.query.lat, lng: req.query.lng};
}