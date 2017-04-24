var express = require('express');  
var request = require('request');
var _ = require('lodash');
// var DarkSky = require('forecast.io');
// var util = require('util');

var app = express();  

app.use('/darkskySeason', function(req, res){
  // res.json(getDataForRange(req, res));
  getDataForRange(req, res);
});

function getDataForRange(req, res){
//  1. create date array from dates in the request
  var seasonDates = getDateRange(req);
  var seasonData = {
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
    seasonData.data.push(data);
    finished();
  }

  function done(){
    console.log("done, trying to send...");
    res.json(seasonData);
  }
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
      console.log(data);
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


    // getAtTime(lat, lng, unixTime,
    //   function handleResponse(err, res, data){
    //     if(err){
    //       console.log(err);
    //     }else{
    //       seasonData.push(data.daily.data[0]);
    //       finished();
    //     }
    //   });




// var dailydata = [];

// for(var i = 0; i < daysOfYear.length; i++){
//  var unixTime = Math.floor(daysOfYear[i].getTime() / 1000);
//  darksky.getAtTime(sthlm[0], sthlm[1], unixTime,
//    function(err, res, data){
//      dailydata.push(data.daily.data[0]);
//    });
// }

// function getAtTime(lat, lng, time){
//   var data;
//  var url =
//    'https://api.darksky.net/forecast/'
//    + process.env.API_KEY
//    + '/'
//    + lat
//    + ','
//    + lng
//     + ','
//     + time
//    + '?lang=sv&units=si&extend=hourly';

//   request(url, function(err, res, body){
//     if(!error && res.statusCode = 200){
//       return body; 
//     }
//   })

// }

app.listen(process.env.PORT || 3000);

// var now = new Date();
// var daysOfYear = [];
// var endDate = new Date(2016, 7, 1);
// for(var d = new Date(2016, 5, 1); d < endDate ; d.setDate(d.getDate()+1)){
//  daysOfYear.push(new Date(d));
// }



// app.use('/darkskyForecast', function(req, res){
// 	var url =
// 		'https://api.darksky.net/forecast/'
// 		+ process.env.API_KEY
// 		+ '/'
// 		+ req.query.lat
// 		+ ','
// 		+ req.query.lng
// 		+ '?lang=sv&units=si&extend=hourly';
// 	req.pipe(request(url)).pipe(res);
// });

// function getAtTime(lat, lng, time){
//   var data;
// 	var url =
// 		'https://api.darksky.net/forecast/'
// 		+ process.env.API_KEY
// 		+ '/'
// 		+ lat
// 		+ ','
// 		+ lng
//     + ','
//     + time
// 		+ '?lang=sv&units=si&extend=hourly';

//   request(url, function(err, res, body){
//     if(!error && res.statusCode = 200){
//       return body; 
//     }
//   })

// }

// var app.use('/getDateRange', function(req, res){
//   var url = 
//   'https://api.darksky.net/forecast/'
//     + process.env.API_KEY
//     + '/'
//     + req.query.lat
//     + ','
//     + req.query.lng
//     + ','
//     + req.query.time
//     + '?lang=sv&units=si&extend=hourly';
//   req.pipe(request(url)).pipe(res);
// });

// var options = {
// 	APIKey: process.env.API_KEY,
// 	timout: 1000
// },
// darksky = new DarkSky(options);

// var sthlm = [59.311469, 18.075428]

// var daily; 

// darksky.getAtTime(sthlm[0], sthlm[1], 1492674647, function(err, res, data){
// 	if (err) throw err;
// 	// console.log('res:' + util.inspect(res));
// 	// console.log('data: ' + util.inspect(data.daily.data));

// 	// daily = data.daily;
// 	// console.log(daily.data);
// });


// console.log(daysOfYear.length);

// console.log(daysOfYear[0].getTime());

// var dailydata = [];

// for(var i = 0; i < daysOfYear.length; i++){
// 	var unixTime = Math.floor(daysOfYear[i].getTime() / 1000);
// 	darksky.getAtTime(sthlm[0], sthlm[1], unixTime,
// 		function(err, res, data){
// 			dailydata.push(data.daily.data[0]);
// 		});
// }

// console.log(dailydata.length);

// app.get('/json', function(req, res){
// 	// res.json({"bloo": "blaa"});
// 	res.json({"dailydata": dailydata});
// });

// app.get('/', function(req, res){
// 	res.sendFile('/index.html', {root: __dirname});
// 	console.log(dailydata.length);
// });

// app.get('/chart.js', function(req, res){
// 	res.sendFile('/chart.js', {root: __dirname});
// });

// app.get('/style.css', function(req, res){
// 	res.sendFile('/style.css', {root: __dirname});
// });

// app.listen(process.env.PORT || 3000);