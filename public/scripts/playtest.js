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
    self.numToDraw         = ko.observable(1);

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
        if (self.drag_start_source() != 'inPlay') {
            self.inPlay.push(self[self.drag_start_source()].splice(self.drag_start_index(), 1)[0]);
            self.inPlay()[self.inPlay().length - 1].tapped(false);
        }
    }

    self.moveCardToGraveyard = function() {
        if (self.drag_start_source() != 'graveyard') {
            self.graveyard.push(self[self.drag_start_source()].splice(self.drag_start_index(), 1)[0]);
        }
    }

    self.moveCardToExile = function() {
        if (self.drag_start_source() != 'exile') {
            self.exile.push(self[self.drag_start_source()].splice(self.drag_start_index(), 1)[0]);
        }
    }

    self.moveCardToHand = function() {
        if (self.drag_start_source() != 'hand') {
            self.hand.push(self[self.drag_start_source()].splice(self.drag_start_index(), 1)[0]);
        }
    }

    self.moveCardToDeck = function() {
        if (self.drag_start_source() != 'deck') {
            self.deck.unshift(self[self.drag_start_source()].splice(self.drag_start_index(), 1)[0]);
        }
    }

    self.drawNum = function() {
        for(let i = 0; i < self.numToDraw(); i++) {
            self.hand.push(self.deck.shift());
        }

        self.numToDraw(1);
    }

    self.tap = function (obj, e) {
        obj.tapped(!obj.tapped());
    }

    self.dragenterEvent = function (obj, e) {
        $(e.target).addClass('dragover');
    }

    self.dragleaveEvent = function (obj, e) {
        $(e.target).removeClass('dragover');
    }

    self.dragoverEvent = function (obj, e) {
        e.preventDefault();
    }

    self.dragendEvent = function (obj, e) {
        self.drag_start_index(-1);
        self.drag_start_source('');
        $(e.target).removeClass('dragSource');
        return true;
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

                console.log(self.allCards().length);
                // 98. why????
                // print out the whole array and see what it is, I guess

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