var getJSON = require('get-json')
var x;
var tem;
var hum;
 
getJSON('http://202.139.192.96:3000/getSensorData')
    .then(function(response) {
        x = response;
        tem = (x[0]['Temperature']);
        hum = (x[0]['Humidity']);
      console.log(tem,hum);
    }).catch(function(error) {
      console.log(error);
    });