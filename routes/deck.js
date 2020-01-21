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
			res.redirect("/deck/edit?deck=" + newlycreated._id);
		}
	});
});

// View Deck Page
router.get("/deck/view/:id", function(req, res){
	Deck.findById(req.params.id)
	.populate('deckCards.id')
	.populate('maybeCards.id')
	.exec(function(err, foundDeck){
		if(err){
			console.log(err);
			req.flash("error", "Could not find deck");
			res.redirect("/");
		} else {
			var sortedCards = middleware.sortCardList(req, foundDeck);
			foundDeck.maybeCards.objSort("name");

			res.render("deck/view", {deck: foundDeck, sortedCards: sortedCards});				
		}
	});
});

// Load Edit Page
router.get("/deck/edit", function(req, res){
	var deckId = req.query.deck;
	res.render("deck/edit", {deckId: deckId});
});

// Load Mass Add Page
// middleware.checkDeckOwnership
router.get("/deck/massadd/:id", function(req, res){
	res.render("deck/massadd", {deckId: req.params.id})
});

// Mass Add Action
// middleware.checkDeckOwnership
router.post("/deck/massadd/:id", function(req, res){
	Deck.findById(req.params.id)
	.exec(function(err, foundDeck){
		if(err){
			console.log(err);
			req.flash("error", "Could not find deck");
			res.redirect("/");
		} else {
			var newMainBoard = returnCardsArray(req.body.mainboard),
				newMaybeBoard = returnCardsArray(req.body.maybeboard);


			Card.find({
				'name': {
					$in: newMainBoard.names
				}
			}, function(err, docs) {
				if(err) {
					console.log(err);
				} else if (docs) {
					var newMainCards = [],
					    newMaybeCards = [];

					docs.forEach(function(foundCard) {
						amount = newMainBoard.amounts[newMainBoard.names.indexOf(foundCard.name)];
	
						var newCard = {
							cut: false,
							buy: false,
							name: foundCard.name,
							number: amount,
							id: foundCard._id
						}
	
						newMainCards.push(newCard);
					});
	
					Card.find({
						'name': {
							$in: newMaybeBoard.names
						}
					}, function(err, docs) {
						if(err) {
							console.log(err);
						} else if (docs) {
							docs.forEach(function(foundCard) {
								var newCard = {
									buy: false,
									name: foundCard.name,
									id: foundCard._id
								}
			
								newMaybeCards.push(newCard);
							});	

							foundDeck.deckCards = newMainCards;
							foundDeck.maybeCards = newMaybeCards; 
							foundDeck.dateUpdated = dateFormat(Date.now(), "mmmm dS, yyyy");
							foundDeck.save(function(err) {
								if (err) {
									console.log(err);
								}
							});

							res.redirect("/deck/edit?deck=" + foundDeck._id);
						}
					});
				}
			});
		}
	});
});

function returnCardsArray(input) {
	var newCards = {
		names: [],
		amounts: []
	};

	if (input && input.length > 0) {
		var arr = input.split("\n");
			
		arr.forEach(function(line) {
			if(line && line.length > 0) {
				line = line.replace(/\*([A-Z])*\*/i, "");
				line = line.replace(/\(([A-Z0-9])*\)/i, "");
				
				var amount = line.match(/([0-9]*)x\s/g);
				
				if(amount[0] && amount[0].length > 0) {
					line = line.replace(amount, "");
					line = line.trim();
					newCards.names.push(line);
					
					amount = amount[0].replace(/x\s/, "");
					newCards.amounts.push(amount);
				}
			}
		});
	}

	return newCards;
}

module.exports = router;