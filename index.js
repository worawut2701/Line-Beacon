'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const config = require('./config.json');


var getJSON = require('get-json');
var rp = require('request-promise');
var x;
var tem;
var hum;
var numin = 0 , numout =0 ,sum = 0;
var ms;


// create LINE SDK client
const client = new line.Client(config);

const app = express();

// webhook callback
app.post('/webhook', line.middleware(config), (req, res) => {
  // req.body.events should be an array of events
  if (!Array.isArray(req.body.events)) {
    return res.status(500).end();
  }
  // handle events separately
  Promise.all(req.body.events.map(event => {
    console.log('event', event);
    // check verify webhook event
    if (event.replyToken === '00000000000000000000000000000000' ||
      event.replyToken === 'ffffffffffffffffffffffffffffffff') {
      return;
    }
    return handleEvent(event);
  }))
    .then(() => res.end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// simple reply function
const replyText = (token, texts) => {
  texts = Array.isArray(texts) ? texts : [texts];
  return client.replyMessage(
    token,
    texts.map((text) => ({ type: 'text', text }))
  );
};

// callback function to handle a single event
// callback function to handle a single event
function handleEvent(event) {
  switch (event.type) {
    case 'message':
      const message = event.message;
      switch (message.type) {
        case 'text':
          return handleText(message, event.replyToken);
        case 'image':
          return handleImage(message, event.replyToken);
        case 'video':
          return handleVideo(message, event.replyToken);
        case 'audio':
          return handleAudio(message, event.replyToken);
        case 'location':
          return handleLocation(message, event.replyToken);
        case 'sticker':
          return handleSticker(message, event.replyToken);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }

    case 'follow':
      return replyText(event.replyToken, 'Welcome TESA 2019');

    case 'unfollow':
      return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);

    case 'join':
      return replyText(event.replyToken, `Joined ${event.source.type}`);

    case 'leave':
      return console.log(`Left: ${JSON.stringify(event)}`);

    case 'postback':
      let data = event.postback.data;
      return replyText(event.replyToken, `Got postback: ${data}`);

    case 'beacon':
      const dm = `${Buffer.from(event.beacon.dm || '', 'hex').toString('utf8')}`;

      const bty = event.beacon.type;
      const bid = event.beacon.hwid;
      console.log(bid,bty);
        
        rp({
          method: 'POST',
          uri: 'http://202.139.192.96:3000/putSanam',
          body: {
              "BeaconID": bid,
              "Status": bty
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


            if (bty === 'enter'){
              numin = numin+1;
            }else if (bty === 'leave'){
              numout = numout+1
            }

            sum = Math.abs(numin-numout);
            
            if (sum >= 3){
                ms = 'จำนวนคนเกิน กรุณาเชิญออกจากบริเวณ';
            }else{
              ms = 'ยินดีต้อนรับ';
            }

            console.log(`sum =  ${sum}`);

      return replyText(event.replyToken, ms);
      //return replyText(event.replyToken, `${bty} beacon hwid : ${bid} with device message = ${dm}`);
    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}

getJSON('http://202.139.192.96:3000/getSensorData')
    .then(function(response) {
        x = response;
        tem = (x[0]['Temperature']);
        hum = (x[0]['Humidity']);
    }).catch(function(error) {
      console.log(error);
    });

function handleText(message, replyToken) {
  switch (message.text) {
    case 'Admin_Mon':
      return replyText(replyToken, 'อุณหภูมิ ' + tem +' องศา \n'+ 'ความชื้น '+ hum +' % \n'+'จำนวนผู้คนที่เข้าชม 2 แสนคน');
    default:
      return replyText(replyToken, message.text);
  }

}

function handleImage(message, replyToken) {
  return replyText(replyToken, 'Got Image');
}

function handleVideo(message, replyToken) {
  return replyText(replyToken, 'Got Video');
}

function handleAudio(message, replyToken) {
  return replyText(replyToken, 'Got Audio');
}

function handleLocation(message, replyToken) {
  return replyText(replyToken, 'Got Location');
}

function handleSticker(message, replyToken) {
  return replyText(replyToken, 'Got Sticker');
}

const port = config.port;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
