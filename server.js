require('dotenv').config();
var express = require('express');  
var darkskyDateRange = require("./darksky-daterange.js");

var app = express();
app.listen(process.env.PORT || 3000);

app.use(express.static('public'));

app.use('/darkskySeason', function(req, res){
  // darkskyDateRange.getDataForRange(req, res);
  var latlng = {lat: req.query.lat, lng: req.query.lng};
  var startDate = new Date(req.query.startDate);
  var endDate = new Date(req.query.endDate);

  darkskyDateRange.getDataForRange(latlng, startDate, endDate, function(err, result){
    if (err) {
      res.status(400).send("Couldn't get weatherdata");
      return console.error("Something went wrong getting the weatherdata", err);
    }
    else{
      res.json(result);
    }
  });
});