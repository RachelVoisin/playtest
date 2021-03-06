var mongoose = require("mongoose");

var deckSchema = new mongoose.Schema({
	name: String,
	image: String,
    color: String,
    format: String,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	dateUpdated: String,
	deckCards: [{
                cut: Boolean,
                buy: Boolean,
                name: String,
                number: Number,
                id: {
                    type: mongoose.Schema.Types.ObjectId,
				    ref: "Card"	
                }		
			}],
    maybeCards: [{
        buy: Boolean,
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Card"	
        }		
    }]
});

// date should be saved as universal and formatted at output 

module.exports = mongoose.model("Deck", deckSchema);