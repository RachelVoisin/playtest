In summary you'll run it like

node stuff.js blah hee "whoohoo!"

Then your arguments are available in process.argv



// print process.argv
process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
  });


var mongoose = require("mongoose");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var Card = require("./models/card");
var Deck = require("./models/deck");

// var cardsJSON = require("./scryfall-oracle-cards.json");
	
// Card.remove({}, function(err){
// 	if(err){
// 		console.log(err);
// 	}
// 	else {
// 		console.log("removed cards");
// 	}
// });

var types = ["Artifact", "Creature", "Enchantment", "Instant", "Land", "Planeswalker", "Sorcery"];
var request = new XMLHttpRequest();
request.onreadystatechange = function () {
    if (request.readyState === 4 && request.status === 200) {
        var allCards = JSON.parse(request.responseText);

        allCards.forEach(function(card){
            var name     = card.name,
                image    = card.image_uris.normal,
                typeLine = card.typeLine,
                manaCost = card.mana_cost,
                cmc      = card.cmc, 
                oracleid = card.oracle_id;

            var cardTypes = [];
            types.forEach(function(type) {
                if (typeLine.indexOf(type)) {
                    cardTypes.push(type);
                }
            });

            var w = (manaCost.match(/W/g) || []).length,
                u = (manaCost.match(/U/g) || []).length,
                b = (manaCost.match(/B/g) || []).length,
                r = (manaCost.match(/R/g) || []).length,
                g = (manaCost.match(/G/g) || []).length,
                c = (manaCost.match(/C/g) || []).length;

            var total = w + u + b + r + g + c;

            var manaSymbols = {
                W: w,
                U: u,
                B: b,
                R: r,
                G: g,
                C: c,
                Total: total,
            };

            var newCard = new Card({
                name: name,
                image: image,
                types: cardTypes,
                cmc: cmc,
                oracleid: oracleid,
                manaCost: manaCost,
                manaSymbols: manaSymbols,
            });
                
            Card.create(newCard, function(err, newlyCreated){
                if(err){
                    console.log(err);
                } 
            });			
        });
        console.log("Added all cards");
    }
    if(request.status === 429){
        console.log("Too Many Requests");
    }
};
request.open('GET', "https://archive.scryfall.com/json/scryfall-oracle-cards.json");
request.send();
// https://archive.scryfall.com/json/scryfall-oracle-cards.json   download the file and put it in root