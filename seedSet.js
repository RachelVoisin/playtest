var mongoose = require("mongoose");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

mongoose.connect("mongodb://localhost/playtest");

var Card = require("./models/card");

const types = ["Artifact", "Creature", "Enchantment", "Instant", "Land", "Planeswalker", "Sorcery"];
var request = new XMLHttpRequest();
request.onreadystatechange = function () {
    if (request.readyState === 4 && request.status === 200) {
        var data = JSON.parse(request.responseText);

        if (data.object == "error") {
            console.log(cards);
        } else {
            var cards = data.data;

            cards.foreach(function(card) {
                if () {
                    // card exists in system
                    // update image
                } else {
                    // add new card
                }
            });
        }
    }
    if(request.status === 429){
        console.log("Too Many Requests");
    }
};
request.open('GET', "https://api.scryfall.com/cards/search?q=set%3A" + process.argv[2]);
request.send();

/*
look here for set codes: https://scryfall.com/advanced

set code should be 3 letter, lowercase, eg.  https://api.scryfall.com/cards/search?q=set%3Athb

to run this file, use 3 letter set name as variable, ex. `node seedSet.js thb`
*/