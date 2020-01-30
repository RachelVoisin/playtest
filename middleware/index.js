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
    var overlap = req.query.overlap || true;

    var sortedCards = [];

    if (sort == "type") {
        var sorter    = ["Creature", "Enchantment", "Artifact", "Instant", "Sorcery", "Planeswalker", "Land"],
            usedCards = [];
        sorter.forEach(function(type) {
            var section = {
                subtitle: type,
                cards: [],
                total: 0
            };
            deck.deckCards.forEach(function(card) {
                if (card.id.types.includes(type)) {
                    if (overlap == "false") {
                        if (!usedCards.includes(card.id.oracleid)) {
                            usedCards.push(card.id.oracleid);
                            section.cards.push(card);
                            section.total += card.number;
                        }
                    } else {
                        section.cards.push(card);
                        section.total += card.number;
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
            if (!sorter.includes(card.id.cmc)) {
                sorter.push(card.id.cmc);
            }
        });

        sorter.sort(function(a,b){ return a - b; });

        sorter.forEach(function(sort) {
            var section = {
                subtitle: sort,
                cards: []
            };
            
            deck.deckCards.forEach(function(card) {
                if (card.id.cmc == sort) {
                    section.cards.push(card);
                }
            });

            sortedCards.push(section);
        });

    } else if (sort == "color") {
        var sorter = ["W", "U", "B", "R", "G", "C"];
        sorter.forEach(function(sort) {
            var section = {
                subtitle: sort,
                cards: []
            };
            
            deck.deckCards.forEach(function(card) {
                if (card.id.colorIdentity.includes(sort)) {
                    section.cards.push(card);
                }
            });

            if (section.cards.length > 0) {
                sortedCards.push(section);
            }
        });
    }
    
    return sortedCards;
}

module.exports = middlewareObj;