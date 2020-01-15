var express = require("express");
var router = express.Router();

var dateFormat = require("dateformat");

var objSort    = require("../public/scripts/objSort");
var middleware = require("../middleware");

var User = require("../models/user"),
    Deck = require("../models/deck"),
	Card = require("../models/card");

//var middleware = require("../middleware"); // contents of index.js is automatically required if you require a directory

// Create New Deck Page
router.get("/deck/new", middleware.isLoggedIn, function(req, res){ 
    res.render("deck/new.ejs", {});
});

// Create New Deck
router.post("/deck/new", middleware.isLoggedIn, function(req, res){
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
router.get("/deck/:id/edit", middleware.checkDeckOwnership, function(req, res){
	Deck.findById(req.params.id)
	.exec(function(err, foundDeck){
		if(err){
			console.log(err);
			req.flash("error", "Could not find deck");
			res.redirect("/");
		} else {
			foundDeck.deckCards.objSort("name");
            foundDeck.maybeCards.objSort("name");
            
			res.render("deck/edit", {deck: foundDeck});				
		}
	});
});

// Edit Deck Details
router.post("/deck/:id/edit", middleware.checkDeckOwnership, function(req, res){
	
});

// Add Card to Deck
router.post("/deck/:id/add", middleware.checkDeckOwnership, function(req, res) {
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
					//req.flash("error", "Could not find card with that name.");
                    //res.redirect("/deck/" + foundDeck._id + "/edit");
                    res.send(JSON.stringify(
                        {
                            status: "error",
                            message: "Could not find card with that name."
                        }
                    ));
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
                        //res.redirect("/deck/" + foundDeck._id + "/edit");
                        res.send(JSON.stringify(
                            {
                                status: "success",
                                duplicate: true,
                                card: foundCard
                            }
                        ));
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
                        //res.redirect("/deck/" + foundDeck._id + "/edit");

                        res.send(JSON.stringify(
                            {
                                status: "success",
                                duplicate: false,
                                card: foundCard
                            }
                        ));
                    }
				}
			});					
		}
	});
});

// Card Actions
router.post("/deck/:id/edit/cards", middleware.checkDeckOwnership, function(req, res) {
    // remove
    // move
    // cut
    // buy
    // update number
});

module.exports = router;