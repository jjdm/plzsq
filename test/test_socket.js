"use strict";
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const chai = require('chai');
const expect = chai.expect;
const log = require('./../lib/utils').logger;
let socket = require('./../lib/socket').instance();

/**
 * Mock object that registers with socket.
 */
const MockRobot = function() {
	let self = this;
	self.count = 0;
	let _count = 0;
	self.increment = function(message) {
		self.count += 1;
		_count += 2;
	};
	self.getInternalCount = function() {
		return _count;
	};
	self.doNothing = function() {
		return 0;
	}
	self.registerWithSocket = function(socket) {
		// only register with BID
		socket.registerOnMessage("BID", self.increment);
		socket.registerOnMessage("ASK", self.doNothing);
	}
}

describe('test_socket', function() {

	// setup websocket
	const port = 8989;
	const app = express();
	app.set('port', port);
	const server = http.createServer(app);
	const wss = new WebSocket.Server({ server });
	socket.initialize(wss);
	server.listen(port, function () {
		log.info('Listening on %d', server.address().port);
	});

	it('test_socket_basic', function(done) {
		// need to check the log for this one
		setTimeout(done, 50);
		const client = new WebSocket(`ws://localhost:${port}`);
		let robot = new MockRobot();
		robot.registerWithSocket(socket);
		client.on('open', function open() {
		  client.send(JSON.stringify({type: "BID", data: {user: "a1", amount: 20} }));
		  client.send(JSON.stringify({type: "ASK", data: {user: "a2", amount: 10} }));
		  client.send(JSON.stringify({type: "BID", data: {user: "a3", amount: 30} }));
		});
		setTimeout(function() {
			expect(robot.count).to.equal(2);
			expect(robot.getInternalCount()).to.equal(4);
		}, 25);
	}),
	it('test_socket_user', function(done) {
		// need to check the log for this one
		setTimeout(done, 50);
		const client = new WebSocket(`ws://localhost:${port}/?user=a1`);
		client.on('open', function open() {
		  log.debug('Opened WS client.');
		});
	})
});
