require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const router = require('./src/router');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', router);

app.post('/', (req, res) => {
    res.send('This is POST');
});
app.use('/*', (req, res, next) => {
    console.log(req.method);
    next();
});

module.exports = app;
