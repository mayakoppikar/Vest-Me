 var mongoose        = require("mongoose");


var investmentSchema = new mongoose.Schema({
	ticker: String,
	numberofshares: Number,
	initialprice: Number,
	link: String,
	soldorcurrent: Boolean,
	sellingprice: Number,
	emailormanual:String,
	useremail: String,
	scenario: {
		id:{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Scenario"
		   }
	}
	

});

module.exports = mongoose.model("Investment", investmentSchema);
