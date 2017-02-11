const express = require('express');
const router = express.Router();

module.exports = function(wss) {

	wss.on('connection', function connection(ws) {

		console.log("Websocket connected %s", ws);
	});

	/* GET home page. */
	router.get('/', function(req, res, next) {
	  res.render('index', { title: 'Express', useCdn: false });
	});

	return router;

};
