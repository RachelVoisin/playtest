function Card(card) {
    var self    = this;
    self.id     = card.id._id;
    self.name   = card.name;
    self.image  = card.id.image;
    self.tapped = ko.observable(false);
}

function DeckViewModel() {
    var self = this;

    const queryString = window.location.search;
    const urlParams   = new URLSearchParams(queryString);
    const deckId      = urlParams.get('deck');

    self.allCards  = ko.observableArray();
    self.deck      = ko.observableArray();
    self.hand      = ko.observableArray();
    self.graveyard = ko.observableArray();
    self.exile     = ko.observableArray();
    self.inPlay    = ko.observableArray();

    self.drag_start_index  = ko.observable();
    self.drag_start_source = ko.observable();

    self.shuffle = function() {
        var array = self.deck();

        // Fisher-Yates shuffle
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1)); 
            [array[i], array[j]] = [array[j], array[i]];
        }

        self.deck(array);
    }

    self.restart = function() {
        self.deck(self.allCards());
        self.hand.removeAll();
        self.graveyard.removeAll();
        self.exile.removeAll();
        self.inPlay.removeAll();

        self.shuffle();

        for(let i = 0; i < 7; i++) {
            self.hand.push(self.deck.shift());
        }
    }

    self.moveCardToPlay = function() {
        if (self.drag_start_source() == 'hand') {
            self.inPlay.push(self.hand.splice(self.drag_start_index(), 1)[0]);
        }
    }

    self.moveCardToGraveyard = function() {
        if (self.drag_start_source() == 'hand') {
            self.graveyard.push(self.hand.splice(self.drag_start_index(), 1)[0]);
        }
    }

    self.moveCardToExile = function() {
        if (self.drag_start_source() == 'hand') {
            self.exile.push(self.hand.splice(self.drag_start_index(), 1)[0]);
        }
    }

    $.ajax({
        type: "GET",
        url: '/deckapi/getDeck?id=' + deckId,
        success: function(result) {
            if (result.status == "error") {
                alert(result.message);
            } else if (result.status == "success") {
                result.deckData.deckCards.forEach(function(card) {
                    for(let i = 0; i < card.number; i++) {
                        self.allCards.push(new Card(card));
                    }
                });

                self.restart();
            }
        },
        error: function (jXHR, textStatus, errorThrown){
            console.log(errorThrown);
            console.log(textStatus);
            console.log(jXHR);
        },
        dataType: "JSON"
    });
}

ko.applyBindings(new DeckViewModel());