'use strict';

var express = require('express');

// Constants
var PORT = 3000;

// App
var app = express();

// app.use('/static', express.static('dist'));

app.use(express.static('dist'));

// Add headers
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT);
console.log("Running on http://localhost:" + PORT);