var mongoose = require("mongoose"),
    fs       = require('fs');

mongoose.connect("mongodb://localhost/playtest");

// https://archive.scryfall.com/json/scryfall-oracle-cards.json   download the file and put it in bulkData

var Card = require("../../models/card");
	
Card.find({}, function(err, allCards) {
    if (err) {
        console.log(err);
    } else {
        var rawdata   = fs.readFileSync('public/bulkData/scryfall-oracle-cards.json');
        var cardsJSON = JSON.parse(rawdata);

        allCards.forEach(function(card) {
            var jsonCard = cardsJSON.find(element => element.oracle_id == card.oracleid);

            if (jsonCard) {
                if (jsonCard.color_identity.length == 0) {
                    card.colorIdentity = ["C"];
                } else {
                    card.colorIdentity = jsonCard.color_identity;
                }

                card.save(function(err) {
                    if (err) {
                        console.log(err);
                    }
                });                
            }
        });

        console.log("Finished adding all info");
    }
});