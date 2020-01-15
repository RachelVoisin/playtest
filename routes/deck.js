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
router.get("/deck/view/:id", function(req, res){
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
// Cannot check deck ownership because no req.params.id
router.get("/deck/edit", function(req, res){
	res.render("deck/edit");
});

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
                        res.send({
                            status: "success"
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
            if (req.body.action == "remove") {

            }
    //         <option value="remove">Delete</option>
    // <option value="maybe">Move to Maybeboard</option>
    // <option value="cut">Mark as Cuttable</option>
    // <option value="buy">Mark as Not Owned</option>
    //     }
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