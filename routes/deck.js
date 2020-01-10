var express = require("express");
var router = express.Router();

var dateFormat = require("dateformat");

var objSort = require("../public/scripts/objSort");

var User = require("../models/user"),
    Deck = require("../models/deck"),
	Card = require("../models/card");

//var middleware = require("../middleware"); // contents of index.js is automatically required if you require a directory

// Create New Deck Page
router.get("/deck/new", function(req, res){
    //check if logged in 
    res.render("deck/new.ejs", {});
});

// Create New Deck
router.post("/deck/new", function(req, res){
    var name        = req.body.name,
	    image       = req.body.image,
        color       = req.body.color,
        format      = req.body.format,
        dateUpdated = dateFormat(Date.now(), "mmmm dS, yyyy"),
        author      = {
            id: req.user._id,
            username: req.user.username
        };
	
	var newDeck = {
		name: name, 
		image: image, 
		author: author, 
        color: color, 
        format: format,
		dateUpdated: dateUpdated
    };
    
	Deck.create(newDeck, function(err, newlycreated){
		if(err){
			console.log(err);
		} else {
            req.flash("success", "New deck created.");
            res.redirect("/deck/" + newlycreated._id + "/edit");
		}
	});
});

// View Deck Page
router.get("/deck/:id", function(req, res){
	Deck.findById(req.params.id)
	.exec(function(err, foundDeck){
		if(err){
			console.log(err);
			req.flash("error", "Could not find deck");
			res.redirect("/");
		} else {
			var sortedDeck       = foundDeck.deckCards.objSort("name");
			var sortedMaybeBoard = foundDeck.maybeCards.objSort("name");

			res.render("deck/view", {deck: foundDeck, deckCards: sortedDeck, maybeCards: sortedMaybeBoard});				
		}
	});
});

// Edit Deck Page
router.get("/deck/:id/edit", function(req, res){
	Deck.findById(req.params.id)
	.exec(function(err, foundDeck){
		if(err){
			console.log(err);
			req.flash("error", "Could not find deck");
			res.redirect("/");
		} else {
			foundDeck.deckCards.objSort("name");
            foundDeck.maybeCards.objSort("name");
            
            // send an array of objects containing subtitle and array of cards 

            // include option to show all cards in all applicable categories 

			res.render("deck/edit", {deck: foundDeck});				
		}
	});
});

// Add Card to Deck
router.post("/deck/:id/add", function(req, res) {
    // check if card is already there, uptick number, not add again!

    Deck.findById(req.params.id)
	.exec(function(err, foundDeck){
		if(err){
			console.log(err);
			req.flash("error", "Could not find deck");
			res.redirect("/");
		} else {
            Card.findOne({ 'name' : req.body.name }, function(err, foundCard){
				if(err){
					console.log(err);
				} else if(!foundCard){
					req.flash("error", "Could not find card with that name.");
					res.redirect("/deck/" + foundDeck._id + "/edit");
				} else {
                    var newCard = {
                        cut: false,
                        buy: false,
                        name: foundCard.name,
                        number: 1,
                        id: foundCard._id
                    }

                    foundDeck.deckCards.push(newCard);
					foundDeck.dateUpdated = dateFormat(Date.now(), "mmmm dS, yyyy");
					foundDeck.save();
					res.redirect("/deck/" + foundDeck._id + "/edit");
				}
			});					
		}
	});
});

function renderCardList(req, deck) {
    deck.deckCards.objSort("name");
    deck.maybeCards.objSort("name");

    var sort = req.query.sort || "type";
    var overlap = req.query.overlap ? true : false;

    var deckCards = [];
    var sorter = "";

    if (sort == "type") {
        sorter = ["Creature", "Enchantment", "Artifact", "Instant", "Land", "Planeswalker", "Sorcery"];
        sorter.forEach(function(type) {
            var section = {
                subtitle: type,
                cards: []
            };
            deck.deckCards.forEach(function(card, index) {
                // populate cards?
                if (card.types.includes(type)) {
                    section.cards.push(card);
    
                    if(overlap == false) {
                        deck.cards.splice(index, 1);
                    }
                }
            });
    
            if (section.cards.length > 0) {
                deckCards.push(section);
            }
        });
    } else if (sort == "cmc") {
        sorter = [];

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
        // gotta change card model
        sorter = ["White", "Blue", "Black", "Red", "Green", "Colorless"];
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
            });

            if (section.cards.length > 0) {
                deckCards.push(section);
            }
        });
    }
    
    return deckCards;
}

module.exports = router;