/* Used to share message models between Angular and Node */
var model = {
	bid: function(user, amount) {
		return {
			type: 'BID',
			user: user,
			amount: amount
		}
	}
};

/*

From Client-to-Server
	Experimenter
		Upload file/configuration
		Start instructions
		Start trading
		[Start participation]
		Start round
		End round

*/
