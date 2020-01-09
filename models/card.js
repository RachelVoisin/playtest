var mongoose = require("mongoose");

var cardSchema = new mongoose.Schema({
	name: String,
	image: String,
    types: [String],
    cmc: Number,
    oracleid: String,
    manaCost: String,
    manaSymbols: {
        W: Number,
        U: Number,
        B: Number,
        R: Number,
        G: Number,
        C: Number,
        Total: Number,
    },
});

// legality

module.exports = mongoose.model("Card", cardSchema);