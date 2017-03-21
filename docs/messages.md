# JSON Messaging in Plaza Squareplzsq

Internally, Plaza Square (`plzsq`) uses JSON to message between the client web browser and the node/express based server.  This document is a reference to show the types of messages used. To start, the following show the main message groupings:

*	Client Generated Messages
*	Responses to Client Messages
*	Server Generated Broadcast Messages

The sections below dive into each message type, and show the associated structure of each.  Regardless of the message type, each message is given a unique `id` and `timestamp`, generated on either server creation or on server receipt.

# Client Generated Messages

Client generated actions originate with the end user.  In `plzsq`, there are two main types of users:

* __Experimenter__ - administrators who upload configuration, control state changes (e.g. starting rounds).
* __Trader__ - participants of the experiment who login, read instructions, place bids, chat, etc.

These users generate different types of messages.

## Experimenter Messages

The following are key uploads from experimenters, along with example JSON formats for each.

* Configuration upload
* Starting/stopping phases (instructions, trading, rounds, [participation])
* Removing/resetting trader
* Downloading log and report
* [Restarting experiment from scratch or round]

### Configuration Upload

This type of message is delivered in binary format, and does not have an accompanying JSON structure.  Right now, there is only one type of file upload allowed - YAML configuration.

### Phase/STATE Change

State changes are triggered by the server side.  The corresponding experiment state is passed.

```javascript
{
	type: 'CHANGE_STATE',
	action: 'START_ROUND', // START_TRADING, START_ROUND, END_ROUND, [START_PARTICIPATION]
	data {
		round: 2
	}
}
```

### Removing/Resetting Traders

Traders may need to be logged out or reset if there are any issues.  A reset keeps a trader logged in, but clears out all of their data.  They will start back on the first page of the instructions.  A logout takes things a thing further by clearing the login cookie.

```javascript
{
	type: 'RESET',
	action: 'LOGOUT_TRADER', // LOGOUT_ALL, RESET_TRADER, RESET_ALL
	data {
		trader: 'a1' // not included if _ALL
	}
}
```

### Downloading Log

This may not be a WS call - probably a link to a new tab.

```javascript
{
	type: 'DOWNLOAD',
	action: 'LOG', // REPORT
}
```

### Restart

This is an optional feature that will allow an experiment to start back up where it left off.  Useful if an error is encountered.  The thought - every round (or major step), the experiment is serialized down to a file.  At any point, the experimenter can reuse this file, and choose where to start off.  Some potential choices are: 1) Configuration Only (everyone is logged out); 2) Keep Logins; 3) Keep Instructions; 4) After Round Y.

## Participant

Participants can submit the following messages to the server.

* Get Experiment State
* Login
* Enter name
* Wheel prediction and result
* Instructions quiz
* Market - bid, buy, ask, sell
* [Chat]
* [Participate, clues]

### Experiment State

Need to get the full information.  Request, and then await response.

```javascript
{
	type: 'REQUEST_STATE',
}
```

```javascript
{
	state: {
		phase: TRADING // NOT_STARTED, INSTRUCTIONS, TRADING, FINISHED
		subphase: BEFORE_ROUND?
		chatphase
		trading_end: datetime
		current_round
	}
	market: {
		bids, asks, trades
	}
	config: {
		maxPrice
		roundTime
	}
	chats: {
	
	}
	trader {
		shares
		cash
		clues
	}
}
```

The participant can request submit (post)

## Server Broadcast

### State Changes

State changes are triggered by the server side.  The corresponding experiment state is passed.

```javascript
{
	type: 'STATE_CHANGE'
	state: {
		// experiment state information is here
	}
}
```

*	Client Generated Messages
	- From Participant (Trader)
		* Get Experiment State
		* Login
		* Enter name
		* Wheel prediction and result
		* Instructions quiz
		* Market - bid, buy, ask, sell
		* [Chat]
		* [Participate, clues]
*	Responses to Client Messages
	- Success / Failure based on Client Messages
	- Will generally wrap the original message in a response.
*	Server Generated Messages (Broadcast)
	- State Change
		* Logout Participant
		* Restart Experiment (Instructions, Particular Round)
		* Phase Change (Trading, Round Start, Round End, Experiment End, [Trading Paused], [Chat Paused])
	- Experiment Data
		* Market (bids, asks, trades)
		* Clues and Configuration
		* Time Remaining
		* [Chat in the future] 
	- Trader Progress Information (Sent only to Admin)
		* Instruction Progress
		* Spin Data
		* Test Attempts
		* Round scores, etc.
		
All messages will have: type, creator, [id, date - generated on the server side].
	