
var _ = require('lodash');
var request = require('request');

module.exports.getDataForRange = getDataForRange;

function getDataForRange(latlng, startDate, endDate, callback){
  console.time("test");
	//  1. create date array from dates in the request
  var seasonDates = getDateRange(startDate, endDate);
  var seasonData = {
    "dateRange": "from " + startDate + " to " + endDate,
    "data": []
  };
  var finished = _.after(seasonDates.length, done);

  //  2. loop trough dates array
  //    a. make darksky request for that date
  //    b. return response(?)
  for(var i = 0; i < seasonDates.length; i++){
    var unixTime = Math.floor(seasonDates[i].getTime() / 1000);
    getAtTime(latlng, unixTime, parseData);
  }

  function parseData(err, data){
    if(err){
      console.error(err);
      return finished();
    }
    else if(data.daily == null){
      data.message = "no data for this location at the requested date"
      seasonData.data.push(data);
      return finished();
    }
    else{
      data = data.daily.data[0];
      data.daterange = seasonData.daterange;
      data.latitude = seasonData.latitude;
      data.longitude = seasonData.longitude;
      data.temperatureMean = (data.temperatureMax + data.temperatureMin) / 2;
      seasonData.data.push(data);
      return finished();
    }
  }

  function done(){
    seasonData.data.sort(function(a, b){
      return parseInt(a.time) - parseInt(b.time);
    });

    callback(null, seasonData);
    console.timeEnd("test");
  }
}

function getAtTime(latlng, time, callback){
  var url =
  'https://api.darksky.net/forecast/'
  + process.env.DARKSKY_API_KEY
  + '/'
  + latlng.lat
  + ','
  + latlng.lng
  + ','
  + time
  + '?lang=sv&units=si';

  request.get(url, function(err, res, data){
    if(err){
      console.log(err);
      callback(err, null);
    }else{
      data = JSON.parse(data);
      callback(null, data);
    }
  });
}

function getDateRange(startDate, endDate){
  var season = [];
  for(var d = startDate; d < endDate; d.setDate(d.getDate()+1)){
    season.push(new Date(d));
  }
  console.log(season.length);
  return season;
}