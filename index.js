var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

const JSONbig = require('json-bigint');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function (req, res) {
    res.send('This is NapoBot Server');
});

// Facebook verification webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === process.env.MESSENGER_VALIDATION_TOKEN) {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verification token');
    }
});

// handler receiving messages
app.post('/webhook', function (req, res) {

  var data = JSONbig.parse(req.body);
  messaging_events = data.entry[0].messaging;

  for (i = 0; i < messaging_events.length; i++) {

    event = data.entry[0].messaging[i];
    sender = event.sender.id.toString();

    if (event.message && event.message.text) {
        sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
    }

  }

  res.sendStatus(200);
});

// generic function for sending messages
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.7/me/messages',
        qs: {access_token: process.env.MESSENGER_PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};