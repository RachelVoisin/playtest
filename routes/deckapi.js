var express = require("express");
var router = express.Router();

var dateFormat = require("dateformat");

var objSort    = require("../public/scripts/objSort");
var middleware = require("../middleware");

var User = require("../models/user"),
    Deck = require("../models/deck"),
	Card = require("../models/card");

router.get("/deckapi/getDeck", function(req, res) {
    Deck.findById(req.query.id)
	.exec(function(err, foundDeck){
		if(err){
			console.log(err);
            res.send({
                status: "error",
                message: "Could not find deck" 
            });	
		} else if(foundDeck){
			foundDeck.deckCards.objSort("name");
            foundDeck.maybeCards.objSort("name");
            res.send({
                status: "success",
                data: foundDeck 
            });			
		} else {
            res.send({
                status: "error",
                message: "Could not find deck" 
            });	
        }
	});
});

// Add Card to Deck
// Cannot check deck ownership because no req.params.id
router.post("/deckapi/addCard", function(req, res) {
    Deck.findById(req.body.id)
	.exec(function(err, foundDeck){
		if(err){
            console.log(err);
            res.send({
                status: "error",
                message: "Could not find deck" 
            });	
		} else {
            Card.findOne({ 'name' : req.body.name }, function(err, foundCard){
				if(err){
                    console.log(err);
                    res.send({
                        status: "error",
                        message: "Error: Could not find card with that name: " + req.body.name 
                    });
				} else if(!foundCard){
                    res.send({
                        status: "error",
                        message: "Could not find card with that name: " + req.body.name
                    });
				} else {
                    var duplicate = false;
                    foundDeck.deckCards.forEach(function(card) {
                        if (card.name == foundCard.name) {
                            card.number += 1;
                            duplicate = true;
                        }
                    });

                    if (duplicate) {
                        foundDeck.dateUpdated = dateFormat(Date.now(), "mmmm dS, yyyy");
                        foundDeck.save();
                        res.send({
                            status: "success"
                        });
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

                        foundDeck.deckCards.objSort("name");
                        foundDeck.maybeCards.objSort("name");
                        res.send({
                            status: "success",
                            updatedDeck: foundDeck
                        });
                    }
				}
			});					
		}
	});
});

// Edit Deck Details
// Cannot check deck ownership because no req.params.id
router.post("/deckapi/editDetails", function(req, res) {
    Deck.findById(req.body.id)
	.exec(function(err, foundDeck){
        if(err){
            console.log(err);
            res.send({
                status: "error",
                message: "Could not find deck" 
            });	
		} else {
            foundDeck.name = req.body.name;
            foundDeck.format = req.body.format;
            foundDeck.dateUpdated = dateFormat(Date.now(), "mmmm dS, yyyy");
            foundDeck.save();
            res.send({
                status: "success"
            });
        }
    });
});

// Edit Cards
// Cannot check deck ownership because no req.params.id
router.post("/deckapi/editCards", function(req, res) {
    Deck.findById(req.body.id)
	.exec(function(err, foundDeck){
        if(err){
            console.log(err);
            res.send({
                status: "error",
                message: "Could not find deck" 
            });	
		} else {
            var otherBoard = (req.body.board == "main") ? "maybeCards" : "deckCards",
                board      = (req.body.board == "main") ? "deckCards" : "maybeCards";

            var indexesToBeRemoved = [];

            foundDeck[board].forEach(function (card, index) {
                if (req.body.cards.includes(card.id.toString())) {
                    switch(req.body.action) {
                        case "remove":
                            indexesToBeRemoved.push(index);
                            break;
                        case "move":
                            var newCard;

                            if (req.body.board == "main") {
                                newCard = {
                                    buy: card.buy,
                                    name: card.name,
                                    id: card.id
                                };
                            } else if (req.body.board == "maybe") {
                                newCard = {
                                    buy: card.buy,
                                    cut: false,
                                    number: 1,
                                    name: card.name,
                                    id: card.id
                                };
                            }
                            
                            if (!foundDeck[otherBoard].includes(newCard)) {
                                foundDeck[otherBoard].push(newCard);
                            }
                            indexesToBeRemoved.push(index);
                            break;
                        case "cut":
                            card.cut = !card.cut;
                            break;
                        case "buy":
                            card.buy = !card.buy;
                            break;
                        default:
                            console.log("err: " + req.body.action + " is not an action");
                    }
                } 
            });

            if(indexesToBeRemoved.length > 0) {
                indexesToBeRemoved.sort(function(a,b){ return b - a; });

                indexesToBeRemoved.forEach(function(index) {
                    foundDeck[board].splice(index, 1);
                });
            }

            foundDeck.dateUpdated = dateFormat(Date.now(), "mmmm dS, yyyy");
            foundDeck.save();

            foundDeck.deckCards.objSort("name");
            foundDeck.maybeCards.objSort("name");
            res.send({
                status: "success",
                updatedDeck: foundDeck
            });
        }
    });   
});

router.post("/deckapi/changeCardAmount", function(req, res) {
    Deck.findById(req.body.id)
	.exec(function(err, foundDeck){
        if(err){
            console.log(err);
            res.send({
                status: "error",
                message: "Could not find deck" 
            });	
		} else {
            foundDeck.deckCards.forEach(function (card) {
                if(card.id == req.body.cardId) {
                    if (req.body.change == "increase") {
                        card.number += 1;
                    } else if (req.body.change == "decrease") {
                        card.number -= 1;
                    }

                    foundDeck.dateUpdated = dateFormat(Date.now(), "mmmm dS, yyyy");
                    foundDeck.save();
                    res.send({
                        status: "success"
                    });
                }
            });            
        }
    });
});

router.post("/deckapi/removeCard", function(req, res) {
    Deck.findById(req.body.id)
	.exec(function(err, foundDeck){
        if(err){
            console.log(err);
            res.send({
                status: "error",
                message: "Could not find deck" 
            });	
		} else {
            foundDeck.deckCards.forEach(function (card, index) {
                if(card.id == req.body.cardId) {
                    foundDeck.deckCards.splice(index, 1);

                    foundDeck.dateUpdated = dateFormat(Date.now(), "mmmm dS, yyyy");
                    foundDeck.save();
                    res.send({
                        status: "success"
                    });  
                }
            });          
        }
    });
});

module.exports = router;