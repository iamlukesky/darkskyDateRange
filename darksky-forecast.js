
var request = require('request');

module.exports.getForecast = getForecast;

function getForecast(latlng, callback){

  var url =
  'https://api.darksky.net/forecast/'
  + process.env.DARKSKY_API_KEY
  + '/'
  + latlng.lat
  + ','
  + latlng.lng
  + '?lang=sv&units=si';

  request.get(url, function(err, res, data){
    if(err){
        console.error(err);
        callback(err, null);
    }
    else{
        data = JSON.parse(data);
        callback(null, data);
    }
  });

}