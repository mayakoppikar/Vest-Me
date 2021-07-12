 var mongoose        = require("mongoose");


var scenarioSchema = new mongoose.Schema({
	title: String,
	startval: Number, 
	goalval: Number,
	enddate: Date,
	createdOn: Date,
	currentVal: Number,
	user:{
		id:{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		   },
		username: String
	}

})

module.exports = mongoose.model("Scenario", scenarioSchema);
