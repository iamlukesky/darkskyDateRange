var express = require('express');  
var request = require('request');
var SS = require('simple-statistics');

var _ = require('lodash');

var app = express();
app.listen(process.env.PORT || 3000);

app.get('/', function(req, res){
  res.sendFile('/index.html', {root: __dirname});
});

app.use('/darkskySeason', function(req, res){
  getDataForRange(req, res);
});

function getDataForRange(req, res){
  console.time("test");
//  1. create date array from dates in the request
  var seasonDates = getDateRange(req);
  var seasonData = {
    "key": "from " + req.query.startDate + " to " + req.query.endDate,
    "data": []
  };
  var finished = _.after(seasonDates.length, done);

//  2. loop trough array
//    a. make darksky request for that date
//    b. return response(?)
  for(var i = 0; i < seasonDates.length; i++){
    var unixTime = Math.floor(seasonDates[i].getTime() / 1000);
    var lat = req.query.lat,
        lng = req.query.lng;

    getAtTime(lat, lng, unixTime, parseData);
  }

  function parseData(data){
    data = data.daily.data[0];
    data.key = seasonData.key;
    data.temperatureMean = getMean("temperature", data.hourly.data);
    seasonData.data.push(data);
    finished();
  }

  function done(){
    seasonData.data.sort(function(a, b){
      return parseInt(a.time) - parseInt(b.time);
    });

    res.json(seasonData);
    console.timeEnd("test");
  }
}

function getMean(datapoint, data){ // data is an array of objects
  var values = [];
  for(var i = 0; i < data.length; i++){
    values.push(parseFloat(data[i][datapoint]));
  }
  return SS.mean(values);
}

function getAtTime(lat, lng, time, callback){
  var url =
  'https://api.darksky.net/forecast/'
  + process.env.API_KEY
  + '/'
  + lat
  + ','
  + lng
  + ','
  + time
  + '?lang=sv&units=si';

  request.get(url, function(err, res, data){
    if(err){
      callback(err);
    }else{
      data = JSON.parse(data);
      callback(data);
    }
  });
}

function getDateRange(req){
  var startDate = new Date(req.query.startDate);
  var endDate = new Date(req.query.endDate);
  var season = [];
  for(var d = startDate; d < endDate; d.setDate(d.getDate()+1)){
    season.push(new Date(d));
  }
  console.log(season.length);
  return season;
}