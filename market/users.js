let express = require('express');
let router = express.Router();

let calls = 0;

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send(`You have called user ${++calls} times.`);
});

/* GET users listing. */
router.get('/reset', function(req, res, next) {
	calls = 0;
	res.send('You reset the database.');
});

module.exports = router;
