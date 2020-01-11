var mongoose = require("mongoose"),
    fs       = require('fs');

mongoose.connect("mongodb://localhost/playtest");

var Card = require("../../models/card");

Card.find({}, function(err, allCards) {
    if (err) {
        console.log(err);
    } else {
        var cardsList = [];
        allCards.forEach(function(card) {
            cardsList.push(card.name);
        });
        var json = JSON.stringify(cardsList);
        json = "var data = " + json + ";";

        fs.writeFile('public/bulkData/cardsList.js', json, function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("file written");
            }
        })
    }
});