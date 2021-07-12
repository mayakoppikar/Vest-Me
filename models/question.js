var mongoose = require("mongoose");

//setting up schema and mongoose model

//schema
var questionSchema = new mongoose.Schema({
  question: String
});

//model
var Question = mongoose.model("Question", questionSchema);

module.exports = mongoose.model("Question", questionSchema);
