'use strict';

const express = require('express');

// Constants
const PORT = process.env.PORT || 3000;

// App
const app = express();

app.use(express.static(__dirname + '/dist'));

app.get('/', function (req, res) {
  res.render('/public/index.html');
});

app.listen(PORT);
console.log("Running on http://localhost:" + PORT);
