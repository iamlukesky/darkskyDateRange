require('dotenv').config();
var express = require('express');  
var darkskyDateRange = require("./darksky-daterange.js");

var app = express();
app.listen(process.env.PORT || 3000);

app.use(express.static('public'));

app.use('/darkskySeason', function(req, res){
  darkskyDateRange.getDataForRange(req, res);
});