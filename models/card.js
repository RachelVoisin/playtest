var mongoose = require("mongoose");

var cardSchema = new mongoose.Schema({
	name: String,
	image: String,
    types: [String],
    cmc: Number,
    oracleid: String,
    colorIdentity: [String],
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
    legalFormats: [String],
    flip: Boolean,
    flipImage: String
});

module.exports = mongoose.model("Card", cardSchema);