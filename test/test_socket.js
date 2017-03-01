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

const PORT = 8989;

describe('test_socket', function() {
	before(function(done) {
		setTimeout(done, 100);
		// setup websocket server
		const app = express();
		app.set('port', PORT);
		const server = http.createServer(app);
		const wss = new WebSocket.Server({ server });
		socket.initialize(wss);
		server.listen(PORT, function () {
			log.info('Listening on %d', server.address().port);
		});
    });
	it('test_socket_basic', function(done) {
		// need to check the log for this one
		setTimeout(done, 40);
		const client = new WebSocket(`ws://localhost:${PORT}`);
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
		}, 20);
	}),
	it('test_socket_user', function(done) {
		// need to check the log for this one
		setTimeout(done, 20);
		const client = new WebSocket(`ws://localhost:${PORT}/?user=a1`);
		client.on('open', function open() {
		  log.debug('Opened WS client.');
		});
	}),
	it('test_socket_multiuser', function(done) {
		// need to check the log for this one
		setTimeout(done, 30);
		let client1Count = 0;
		let client2Count = 0;
		const client1 = new WebSocket(`ws://localhost:${PORT}/?user=a1`);
		const client2 = new WebSocket(`ws://localhost:${PORT}/?user=a2`);
		client1.onmessage = function() { client1Count++; };
		client2.onmessage = function() { client2Count++; };
		setTimeout(function() {
			socket.broadcast({type: "SOMETHING", amount: 20});
			socket.send("a1", {type: "SOMETHING ELSE", amount: 50});
		}, 10);
		setTimeout(function() {
			expect(client1Count).to.equal(2);
			expect(client2Count).to.equal(1);
		}, 20);
	})
});
