var middlewareObj = {};

var Deck = require("../models/deck"),
    Card = require("../models/card");

middlewareObj.checkDeckOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Deck.findById(req.params.id, function(err, foundDeck){
			if(err){
				res.redirect("back");
			} else { 
				if(foundDeck.author.id.equals(req.user._id)) { 
					next();
				} else {
					req.flash("error", "Permission Denied.");
					res.redirect("back");
				}
			}
		});
	} else {
		req.flash("error", "You must be logged in to do that.");
		res.redirect("back");
	}
}

middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "You must be logged in to do that.");
	res.redirect("back");
}

middlewareObj.sortCardList = function(req, deck) {
    deck.deckCards.objSort("name");

    var sort = req.query.sort || "type";
    var overlap = req.query.overlap ? false : true;

    var sortedCards = [];

    if (sort == "type") {
        var sorter    = ["Creature", "Enchantment", "Artifact", "Instant", "Land", "Planeswalker", "Sorcery"],
            usedCards = [];
        sorter.forEach(function(type) {
            var section = {
                subtitle: type,
                cards: []
            };
            deck.deckCards.forEach(function(card) {
                if (card.id.types.includes(type)) {
                    if (overlap == false) {
                        if (!usedCards.includes(card.id.oracleid)) {
                            usedCards.push(card.id.oracleid);
                            section.cards.push(card);
                        }
                    } else {
                        section.cards.push(card);
                    }
                }
            });
    
            if (section.cards.length > 0) {
                sortedCards.push(section);
            }
        });
    } else if (sort == "cmc") {
        var sorter = [];

        deck.deckCards.forEach(function(card) {
            // populate cards?
            if (!sorter.includes(card.cmc)) {
                sorter.push(card.cmc);
            }
        });

        sorter.forEach(function(type) {
            var section = {
                subtitle: type,
                cards: []
            };
            
            deck.deckCards.forEach(function(card) {
                // populate cards?
                if (card.cmc == type) {
                    section.cards.push(card);
                }
            });

            deckCards.push(section);
        });

    } else if (sort == "color") {
        // gotta change card model to be full name to print out full name
        var sorter = ["W", "U", "B", "R", "G", "C"];
        sorter.forEach(function(type) {
            var section = {
                subtitle: type,
                cards: []
            };
            
            deck.deckCards.forEach(function(card) {
                // populate cards?
                if (card.manaSymbols[type] > 0) {
                    section.cards.push(card);
                }

                if (type == "C" && card.manaSymbols.Total == 0) {
                    section.cards.push(card);
                }
            });

            if (section.cards.length > 0) {
                deckCards.push(section);
            }
        });
    }
    
    return sortedCards;
}

module.exports = middlewareObj;