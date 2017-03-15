"use strict";
const PORT = process.env.PORT || 8080;
const USE_CDN = false; // TODO JJDM Tie this to development vs. production
const ADMIN_LOGIN = 'experimenter';

// libraries
const express = require('express');
const fileUpload = require('express-fileupload');
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
app.use(fileUpload());

// set globals
app.use(function(req, res, next) {
	res.locals.useCdn = USE_CDN;
	next();
});

// page routing
app.get('/', function(req, res) {
	res.render('login', { title: 'Login Page' });
});

// logout
app.get('/logout', function(req, res) {
	res.clearCookie('plzsq.user');
	res.redirect('/');
});

// page routing
app.get('/login/:id', function(req, res) {
	let userId = req.params.id;
	// TODO JJDM Need to ensure this is a valid user ID based on configuration
	res.cookie('plzsq.user', userId);
	if(req.params.id == ADMIN_LOGIN) {
		res.redirect('/admin');
	} else {
		res.redirect('/trade');
	}
});

// check for cookie / login
app.use(function(req, res, next) {
	let userId = req.cookies["plzsq.user"];
	if(!userId) {
		let err = new Error('You are not logged into the experiment.');
		err.status = 401;
		next(err);
	} else {
		next()
	}
});

// check for experimenter login
app.use('/admin', function(req, res, next) {
	let userId = req.cookies["plzsq.user"];
	if(userId != ADMIN_LOGIN) {
		let err = new Error('You are not authorized to access this page.');
		err.status = 401;
		next(err);
	} else {
		next()
	}
});

// admin page
app.get('/admin', function(req, res, next) {
	res.locals.title = 'Experimenter Page';
	res.render('admin');
});

// upload file
app.get('/admin/config', function(req, res, next) {
	res.locals.title = 'Experimenter Config Page';
	res.render('admin');
});

// trader
app.get('/trade', function(req, res) {
	res.locals.title = `Chapman Trading for ${req.cookies["plzsq.user"]}`;
	res.render('trade');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	let err = new Error(`File Not Found: ${req.path}`);
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
