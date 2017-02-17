"use strict";
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const chai = require('chai');
const expect = chai.expect;
const log = require('./../lib/utils').logger;
let socket = require('./../lib/socket').instance();

// TODO JJDM Create a test object that will register and handle some internal data
const MockRobot = function() {
	let self = this;
	self.count = 0;
	let _count = 0;
	self.increment = function(message) {
		self.count++;
		_count += 2;
	};
	self.getInternalCount = function() {
		return _count;
	};
	self.registerWithSocket = function(socket) {
		socket.registerOnMessage(socket.MESSAGE_TYPE.BID, self.increment);
	}
}

describe('test_socket', function() {
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
		setTimeout(done(), 50);
		const client = new WebSocket(`ws://localhost:${port}`);
		let robot = new MockRobot();
		robot.registerWithSocket(socket);
		client.on('open', function open() {
		  client.send(JSON.stringify({type: socket.MESSAGE_TYPE.BID, data: {user: "a1", amount: 20} }));
		  client.send(JSON.stringify({type: socket.MESSAGE_TYPE.ASK, data: {user: "a2", amount: 10} }));
		  client.send(JSON.stringify({type: socket.MESSAGE_TYPE.BID, data: {user: "a3", amount: 30} }));
		});
		expect(socket.MESSAGE_TYPE.BID.name).to.equal('BID');
		expect(socket.MESSAGE_TYPE.SELL.value).to.equal(3);
		setTimeout(function() {
			expect(robot.count).to.equal(2);
			expect(robot.getInternalCount()).to.equal(4);
		}, 25);
	})
});
