var rp = require('request-promise');

rp({
    method: 'POST',
    uri: 'http://202.139.192.96:3000/putSanam',
    body: {
        "BeaconID": 093901,
        "Status": "สะเตตัส"
    },
    json: true // Automatically stringifies the body to JSON
}).then(function (parsedBody) {
        console.log(parsedBody);
        // POST succeeded...
    })
    .catch(function (err) {
        console.log(parsedBody);
        // POST failed...
    });