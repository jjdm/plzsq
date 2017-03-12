"use strict";
const PORT = process.env.PORT || 8080;
const USE_CDN = false; // TODO JJDM Tie this to development vs. production

// libraries
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const socket = require('./lib/socket').instance();
const log = require('./lib/utils').logger;
const market = require('./lib/market').instance();

// create the server
const app = express();
app.set('port', PORT);
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
socket.initialize(wss);
market.registerWithSocket(socket);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// parsing
app.use(favicon(path.join(__dirname, 'public', 'img', 'favicon.png')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// page routing
app.get('/', function(req, res) {
	res.locals.title = `Login Page`;
	res.locals.useCdn = USE_CDN;
	res.render('login');
});

// TODO JJDM Logout (remove cookie)

// page routing
app.get('/login/:id', function(req, res) {
	// TODO JJDM Need to ensure this is a valid user ID based on configuration
	res.cookie('plzsq.user', req.params.id);
	res.redirect('/trade');
});

// check for cookie
app.use(function(req, res, next) {
	if(req.cookies["plzsq.user"]) {
		next();
	} else {
		var err = new Error('You are not logged into the experiment.');
		err.status = 401;
		next(err);
	}
});

// page routing
app.get('/trade', function(req, res) {
	res.locals.title = `Chapman Trading for ${req.cookies["plzsq.user"]}`;
	res.locals.useCdn = USE_CDN;
	res.render('trade');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error(`File Not Found: ${req.path}`);
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	log.error(err);
	res.status(err.status || 500);
	res.locals.title = 'Error Page';
	res.render('error', { error: err });
});

// start Listening
server.listen(PORT, function () {
	log.debug('Listening on %d', server.address().port);
});

// error handling for server
server.on('error', function(error) {
	log.error(`Server on error: ${error}`);
	if (error.syscall !== 'listen') {
		throw error;
    }
    switch (error.code) {
		case 'EACCES':
			log.error(PORT + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			log.error(PORT + ' is already in use');
			process.exit(1);
			break;
		default:
			throw error;
	}
});
