Implementation Plan
===================

*	DESIGN: Robot design and sample implementation.
*	End-to-end bid flow (Web page to "database")
*	Finish design on front-end.
*	Finish market actions.
*	Upload new file.
*	Round transition.
*	Excel export after experiment.
*	Save/restart experiments (serialize after each round).
*	Robot implementations.
*	Starting rounds - pause vs. explicit start.

Actions
=======

All messages will have: type, creator, [id, date - generated on the server side]

* From Client-to-Server
	* Experimenter
		* Upload file/configuration (file)
		* Remove trader (userId)
		* Start instructions (command)
		* Start trading (command)
		* [Start participation] (command)
		* Start round (command, roundId)
		* End round (command, roundId)
		* Save log, Save CSV (command, fileType)
		* [Restart experiment/round based on log] (file, round)
	* Trader
		* Enter Name
		* Next/Previous
		* Wheel guess
		* Take test
		* Bid, Ask, Buy, Sell
		* [Chat]
		* [Participate, Clue, Clues]
* From Server-to-Client
	* State Change
		* Restart Instructions
		* Trading Started
		* Trading Paused
		* Round Started/Ended
		* Round will start (auto start)
		* Experiment Ended
		* [Chat Started/Ended]
	* Market Data
		* Clues and Shared Message
		* Time Remaining (State)
		* Book (All bids, asks, trades)
		* Best bid/asks
	* Trader Info (to Experimenter)
		* Instruction guesses
		* Test attempts
		* Round Scores/Cash


Topics to Cover
===============

*	Time-based event storage to allow for market information delays (both to and from market).
*	Thread synchronization to ensure that the items above do not result in race conditions.
*	How much code to migrate directly over from Zocalo (vs. re-writing).
*	Do I need a service layer, or should I put logic in the model (to avoid anemic model).
	- The model itself could be a good way to encapsulate logic and avoid having extra setters.
*	Phases during a round (participation, trading, betting)
*	Should I include the instructions?
	- Leaning towards yes to simplify code

Decisions
=========

*	Filtering (before/after) market actions to allow for autonomous traders. > Register robots, use annotations.
*	Data storage - should I use HSQL or just straight Java for the data store. > Just Java for now.
*	Angular vs. JQuery - does Angular add much. > Angular.
*	Package structure will be by functionality (e.g. market, experiment, instructions, chat)

Robots
=======

Robots will implement an interface (or override an abstract class) that provides the following hooks:

*	Wake Up (Called at timed intervals - not related to a particular market action)
*	Before Bid/Ask/MarketBuy/MarketSell/Cancel
*	After Bid/Ask/MarketBuy/MarketSell/Cancel

Still need to figure out how to order calls to multiple robots.  Could be random, or ordered.

robots
	ordering_per_round: ['random', 'set']
	-	id: r1
		type: QuickStrategy
		round_orders: [1, 2, 1, 4, 5, 6, 7]

Implementation Plan
===================

*	Configuration (Properties or YAML)
*	Data storage (just plain Java)
*	Service layer with Market synchronization
*	Controllers (STOMP for most, initial page loads and templates, Experimenter upload)
*	Pages (Thymeleaf and Angular-based) calling to controllers (http://g00glen00b.be/spring-angular-sockjs/)

Rules
=====

The following are areas with rules defined in Zocalo:

*	Market#gateKeeper (basic checks)
*	UnaryMarket#unaryAssetViolation (enough cash on hand)
*	BinaryMarket#warnUserNoSale
*	Warnable#warn (without log message)

Delay
=====

Going to defer design decision for this one, but it needs to be stored server side.  If market activity is held
and delayed on the client side (JS), then a page refresh would lose it.  For now, just store the exact date/time an
event occurs, and we can build up filtering/delay later.

Robots
======

We are going to do this server side (vs. making them STOMP clients) so that we could order them eventually.  The main
thing we need to handle are the notifications (e.g. market change, state change), and then allowing robots to lock
the market to inspect and then potentially act.  For the "inspectAndAct", the flow will be:

Inteface InspectAndActAware void insectAndAct(TradingFloor floor)
TradingFloor#inspectAndAct(InspectAndActAware iAAA) {
	synchronized(this) {
		iAAA.insectAndAct(this)
	}
}

Look at the callback pattern, and then the robot could basically implement with:

Robot#onMarketChange() {
	TradingFloor.insectAndAct(lambda ->
		check the floor
		use algo to determine action
		take action
	)
}

After any market action (or state change), we will call the AlgoNotifier.  The notifier will loop over the active algorithms (e.g. sequentially, or randomly based on configuration),
then call their applicable method (onBid, onRoundStart, onRoundEnd, onWakeUp, onStateChange, etc.)

Algo Callbacks
==============

Need a synchronized way to allow robots to act based on a condition.  The main one that comes to mind is at the star of
a round.  Only one robot should make the first bid.  It needs to be something like:

1) Robot receives state event (new round).
2) Robot calls trading floor actIf method.
3) Trading floor starts synchronization, then control robot call back method, passing in itself (though trading floor is static).

Layer Design
============
	
Need to be able to reload the configuration, and reset the market/experiment/history when a new file is uploaded.
Would like to leverage spring dependency injection.

MarketController
	ExperimentState
	Configuration
	TradingService

TradingService
	ExperimentState
	Configuration
	MarketDatabase
	
Experiment (singleton)
	ExperimentState
	Configuration
	MarketDatabase
	HistoryDatabase
	- loadExperiment
	- addHistoryItem / getHistory
	- getMarketDb
	- getConfiguration
	- getState
	- getState
	
When configuration reloads (new experiment), we need to recreate:
	Configuration "Holder"
	Market (clear database)
	State (clear state)
	Cached data (rules, robots, etc.)
	
Trying to make these all Spring-managed objects, but they are created when users upload new file.
Does not make sense to make these Spring managed - they are dynamically created.
However, it might make sense to rethink how this works:

ExperimentFactory
	createExperiment -> Experiment (Singleton)
	protected Experiment.load(Yaml)
	The Experiment object controls access to everything else - state, config, rules, etc.
	All methods in experiment should be synchronized.  Prevents status check after new reload has started.

Changing state (end round) - methods in Experiment
	ExperimentTimer - 
	ExperimenterController
	endRound -> MarketEnder (change cash, for a given market) - takes a market and configuration
	startRound -> MarketStarter (set cash, clues) - takes a previous round, 
	startExperiment

	Trader - id
	TraderState - cash, coupons, participationCash, score
	
	Market -> traders (tradersForMarket)
	
(!) Moving to service -> database design with factory setting up the experiment
Experiment will be the singleton facade that provides access to services
Services can contain other services (like a service/business layer)
Wiring up objects will be done in factory

Packages per object type
	
	- [base]
		ExperimentFactory
		Experiment (singleton that is accessed by controllers)
		Status (pojo class that exposes data across services)
	- config
		ConfigurationService
		ConfigurationDatabase
		Configuration
	- history (depends on config)
		HistoryService
		HistoryAware
		HistoryDatabase
		HistoryItem
	- user (depends on config - current state of user (cash, coupon, etc.))
		UserService
		UserDatabase
		User
	- market (depends on config, user, history)
		ScoringService (should scores be stored separate from market?)
		ScoringDatabase (holds the scorers per round, not the scores themselves)
		Scorer
		RulesService (how/when market actions are allowed - runs rules)
		RulesDatabase (holds the rules to run - not the results)
		Rule
		MarketService (takes in scoring and rules services, synchronizes marketdatabase across actions)
		MarketDatabase
		Market (users in market - facade across users)
		MarketController
	- phase (depends on config, history, market)
		PhaseService (change phases, kickoff scoring, updates market, updates users)
		PhaseDatabase
		Phase (holds time, state, etc.)
		PhaseController
		PhaseTimer (controls when things start, etc)
		PhaseNotifier (sends server-driven messages to clients - others are driven by market action)