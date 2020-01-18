var mongoose = require("mongoose"),
    fs       = require('fs');

mongoose.connect("mongodb://localhost/playtest");

// https://archive.scryfall.com/json/scryfall-oracle-cards.json   download the file and put it in bulkData

var Card = require("../../models/card");

var rawdata   = fs.readFileSync('public/bulkData/scryfall-oracle-cards.json');
var cardsJSON = JSON.parse(rawdata);

const types = ["Artifact", "Creature", "Enchantment", "Instant", "Land", "Planeswalker", "Sorcery"];

Card.find({}, function(err, allCards) {
    if(err) {
        console.log(err);
    } else if (allCards) {
        allCards.forEach(function(card) {
            var data = cardsJSON.find(element => element.oracle_id == card.oracleid);

            var typeLine = data.type_line || null,
                cardTypes = [];

            if(typeLine != null) {
                types.forEach(function(type) {
                    if (typeLine.includes(type)) {
                        cardTypes.push(type);
                    }
                });

                card.types = cardTypes;
                card.save(function(err) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        });
        console.log("updated all cards");
    }
});

// cardsJSON.forEach(function(cardInList){
//     Card.findOne({'oracleid': cardInList.oracle_id}, function(err, foundCard) {
//         if(err) {
//             console.log(err);
//         } else if (foundCard) {
//             var typeLine = cardInList.type_line || null,
//                 cardTypes = [];

//             if(typeLine != null) {
//                 types.forEach(function(type) {
//                     if (typeLine.indexOf(type)) {
//                         cardTypes.push(type);
//                     }
//                 });

//                 foundCard.types = cardTypes;
//                 foundCard.save(function(err) {
//                     if (err) {
//                         console.log(err);
//                     }
//                 });
//             }
//         }
//     });
// });