'use strict';

const express = require('express');

// Constants
const PORT = 3000;

// App
const app = express();

app.use('/static', express.static('dist'));

app.get('/', function (req, res) {
  res.sendFile('/public/index.html');
});

app.listen(PORT);
console.log("Running on http://localhost:" + PORT);
