var mongoose = require("mongoose"),
    fs       = require('fs');

mongoose.connect("mongodb://localhost/playtest");

// https://archive.scryfall.com/json/scryfall-oracle-cards.json   download the file and put it in bulkData

var Card = require("../../models/card");
	
Card.remove({}, function(err){
	if(err){
		console.log(err);
	}
	else {
        console.log("removed cards");
        
        var rawdata   = fs.readFileSync('./scryfall-oracle-cards.json');
        var cardsJSON = JSON.parse(rawdata);

        const types = ["Artifact", "Creature", "Enchantment", "Instant", "Land", "Planeswalker", "Sorcery"];

        cardsJSON.forEach(function(card){
            var name     = card.name || null,
                image    = "",
                typeLine = card.type_line || null,
                manaCost = card.mana_cost || null,
                cmc      = card.cmc || 0, 
                oracleid = card.oracle_id;

            if (card.image_uris) {
                image = card.image_uris.normal || null
            } else {
                image = null;
            }

            var cardTypes = [];
            if(typeLine != null) {
                types.forEach(function(type) {
                    if (typeLine.indexOf(type)) {
                        cardTypes.push(type);
                    }
                });
            }

            var manaSymbols = {};
            if(manaCost != null) {
                var w = (manaCost.match(/W/g) || []).length,
                    u = (manaCost.match(/U/g) || []).length,
                    b = (manaCost.match(/B/g) || []).length,
                    r = (manaCost.match(/R/g) || []).length,
                    g = (manaCost.match(/G/g) || []).length,
                    c = (manaCost.match(/C/g) || []).length;

                var total = w + u + b + r + g + c;

                manaSymbols = {
                    W: w,
                    U: u,
                    B: b,
                    R: r,
                    G: g,
                    C: c,
                    Total: total,
                };
            } else {
                manaSymbols = {
                    W: null,
                    U: null,
                    B: null,
                    R: null,
                    G: null,
                    C: null,
                    Total: null,
                };
            }

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
});