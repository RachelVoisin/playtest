var express = require("express");
var router = express.Router();

var dateFormat = require("dateformat");

var objSort    = require("../public/scripts/objSort");
var middleware = require("../middleware");

var User = require("../models/user"),
    Deck = require("../models/deck"),
	Card = require("../models/card");

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

// Load Edit Page
// Cannot check deck ownership because no req.params.id
router.get("/deck/edit", function(req, res){
	res.render("deck/edit");
});

module.exports = router;