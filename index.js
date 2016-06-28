'use strict';

// requires...
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var _ = require('underscore');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function (req, res) {
    res.send('This is the AutoBot Server. Interact with AutoBot on Facebook!');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

// handler receiving messages
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (var i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
            // We have a message, let's see what we can do with it
            if (!detectMessage(event.sender.id, event.message) {
                sendMessage(event.sender.id, {text: "I'm sorry, I didn't get what you said: did you really mean \"" + event.message.text + "?"});
            }
        } else if (event.postback) {
            // This is a way to log stuff...
            console.log("Postback received: " + JSON.stringify(event.postback));
        }
    }
    res.sendStatus(200);
});

function detectMessage(recipientId, message) {
    return (kittenMessage(recipientId, message.text));
}

// generic function that sends a message
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
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

// send rich message with a random kitten
function kittenMessage(recipientId, text) {
    
    text = text || "";

    if (text.toLowerCase().trim() === 'kitten') {            

        // min 100x100 max 600x600 pixels
        var randWidth  = _.random(100,600); 
        var randHeight = _.random(100,600);
        var imageUrl = "https://placekitten.com/" + Number(randWidth) + "/" + Number(randHeight);
        
        var message = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "Here's a kitten!",
                        "subtitle": "Enjoy this cute kitten picture!",
                        "image_url": imageUrl ,
                        "buttons": [{
                            "type": "web_url",
                            "url": imageUrl,
                            "title": "Open kitten link"
                            }, {
                            "type": "postback",
                            "title": "I like this",
                            "payload": "User " + recipientId + " likes kitten " + imageUrl,
                        }]
                    }]
                }
            }
        };

        sendMessage(recipientId, message);
        
        return true;
    }
    
    return false;
    
};