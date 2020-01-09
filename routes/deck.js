var express = require("express");
var router = express.Router();

var dateFormat = require("dateformat");

var objSort = require("../public/scripts/objSort");

var User = require("../models/user"),
    Deck = require("../models/deck"),
	Card = require("../models/card");

//var middleware = require("../middleware"); // contents of index.js is automatically required if you require a directory

router.get("/deck/new", function(req, res){
    //check if logged in 
    res.render("deck/new.ejs", {});
});

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

router.get("/deck/:id/edit", function(req, res){
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

router.post("/deck/:id/add", function(req, res) {
    //add card to deck 
});

module.exports = router;