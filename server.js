"use strict";
// TODO JJDM - externalize configuration port
const port = 8080;

// libraries
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const socket = require('./lib/socket').instance();

// create the server
const app = express();
app.set('port', port);
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
socket.initialize(wss);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// parsing
app.use(favicon(path.join(__dirname, 'public', 'img', 'favicon.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// page routing
app.get('/', function(req, res) {
  res.render('index', { title: 'Express', useCdn: false });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = err;
  res.status(err.status || 500);
  res.render('error');
});

// start Listening
server.listen(port, function () {
	console.log('Listening on %d', server.address().port);
});

// error handling
server.on('error', function(error) {
	if (error.syscall !== 'listen') {
		throw error;
    }
    switch (error.code) {
		case 'EACCES':
			console.error(port + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(port + ' is already in use');
			process.exit(1);
			break;
		default:
			throw error;
	}
});
