function Card(card) {
    var self    = this;
    self.id     = card.id._id;
    self.name   = card.name;
    self.amount = ko.observable(card.number);
    self.cut    = ko.observable(card.cut);
    self.buy    = ko.observable(card.buy);
}

function MaybeCard(card) {
    var self  = this;
    self.id   = card.id._id;
    self.name = card.name;
    self.buy  = ko.observable(card.buy);
}

function DeckViewModel() {
    var self = this;

    const queryString = window.location.search;
    const urlParams   = new URLSearchParams(queryString);
    const deckId      = urlParams.get('deck');

    self.sortType          = ko.observable("type");
    self.overlapCategories = ko.observable(true);
    self.showEdit          = ko.observable(false);

    self.name   = ko.observable();
    self.format = ko.observable();
    self.color  = ko.observable();
    self.image  = ko.observable();

    self.tempName   = ko.observable();
    self.tempFormat = ko.observable();
    self.tempColor  = ko.observable();
    self.tempImage  = ko.observable();

    self.jsonData = ko.observable();
    self.cardJsonData = ko.observable();

    self.colorGradient  = ko.computed(function() {
        return 'linear-gradient(0deg, ' + self.color() + ' 0%, rgba(255,255,255,0) 29%)';
    }, this);

    self.sortedCards = ko.computed(function() {
        if(self.cardJsonData()) {
            var cards = [];

            self.cardJsonData().forEach(function(section) {
                var tempSection = {
                    subtitle: section.subtitle,
                    cards: []
                }
                section.cards.forEach(function(card) {
                    tempSection.cards.push(new Card(card));
                });

                cards.push(tempSection);
            });

            return cards;
        }
    }, this);

    self.maybeCards = ko.computed(function() {
        if(self.jsonData()) {
            var cards2 = [];

            self.jsonData().maybeCards.forEach(function(card) {
                cards2.push(new MaybeCard(card));
            });

            return cards2;
        }
    }, this);

    self.enteredName = function(obj, e) {
        if (e.keyCode == 13){
            self.addCard();
        }
    }

    self.sortChanged = function(obj, e) {
        self.sortType($('.jsSort').val());
        if (e.originalEvent) {
            self.update();
        } 
        return true;
    }

    self.toggleShowEdit = function() {
        self.showEdit(!self.showEdit());
    }

    self.update = function() {
        $.ajax({
            type: "GET",
            url: '/deckapi/getDeck?id=' + deckId + "&sort=" + self.sortType() + "&overlap=" + self.overlapCategories(),
            success: function(result) {
                if (result.status == "error") {
                    alert(result.message);
                } else if (result.status == "success") {
                    self.jsonData(result.deckData);
                    self.cardJsonData(result.cardData);
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

    self.addCard = function() {
        var newCardName = $("#jsCardInput").val();

        if(newCardName && newCardName.length > 0) {
            $.ajax({
                type: "POST",
                url: '/deckapi/addCard?sort=' + self.sortType() + "&overlap=" + self.overlapCategories(),
                data: {id: deckId, name: newCardName},
                success: function(result) {
                    if (result.status == "error") {
                        alert(result.message);
                    } else if (result.status == "success") {
                        $("#jsCardInput").val("");
                        self.cardJsonData(result.cardData); 
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
    };

    self.editDetails = function() {
        var newDeckFormat = $(".jsFormat").val();

        if(!(self.tempName() && self.tempName().length > 0)) {
            self.tempName(self.name());
        }

        if(!(self.tempImage() && self.tempImage().length > 0)) {
            self.tempImage(self.image());
        }

        $.ajax({
            type: "POST",
            url: '/deckapi/editDetails',
            data: {id: deckId, name: self.tempName(), format: newDeckFormat, color: self.tempColor(), image: self.tempImage()},
            success: function(result) {
                if (result.status == "error") {
                    alert(result.message);
                } else if (result.status == "success") {
                    self.name(self.tempName());
                    self.format(newDeckFormat);
                    self.color(self.tempColor());
                    self.image(self.tempImage());

                    if(!self.image() || self.image() == "") {
                        self.image('/images/placeholder.png');
                    }

                    // hide 
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

    self.editCards = function() {
        var action            = $(".jsCardAction").val(),
            checkboxes        = $(".cardCheckbox"),
            checkboxesChecked = [];

        for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                checkboxesChecked.push(checkboxes[i].value);
            }
        }

        if (checkboxesChecked.length > 0) {
            $.ajax({
                type: "POST",
                url: '/deckapi/editCards?sort=' + self.sortType() + "&overlap=" + self.overlapCategories(),
                data: {id: deckId, action: action, cards: checkboxesChecked, board: "main"},
                success: function(result) {
                    if (result.status == "error") {
                        alert(result.message);
                    } else if (result.status == "success") {
                        self.jsonData(result.deckData);
                        self.cardJsonData(result.cardData); 
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
    }

    self.editMaybeCards = function() {
        var action            = $(".jsMaybeCardAction").val(),
            checkboxes        = $(".maybeCardCheckbox"),
            checkboxesChecked = [];

        for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                checkboxesChecked.push(checkboxes[i].value);
            }
        }

        if (checkboxesChecked.length > 0) {
            $.ajax({
                type: "POST",
                url: '/deckapi/editCards?sort=' + self.sortType() + "&overlap=" + self.overlapCategories(),
                data: {id: deckId, action: action, cards: checkboxesChecked, board: "maybe"},
                success: function(result) {
                    if (result.status == "error") {
                        alert(result.message);
                    } else if (result.status == "success") {
                        self.jsonData(result.deckData);
                        self.cardJsonData(result.cardData); 
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
    }
    
    self.removeCard = function(card) {
        $.ajax({
            type: "POST",
            url: '/deckapi/removeCard',
            data: {id: deckId, cardId: card.id},
            success: function(result) {
                if (result.status == "error") {
                    alert(result.message);
                } else if (result.status == "success") {
                    $("." + card.id).remove();
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

    self.increaseCard = function(card) {
        $.ajax({
            type: "POST",
            url: '/deckapi/changeCardAmount',
            data: {id: deckId, cardId: card.id, change: "increase"},
            success: function(result) {
                if (result.status == "error") {
                    alert(result.message);
                } else if (result.status == "success") {
                    card.amount(card.amount() + 1);
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

    self.decreaseCard = function(card) {
        if (card.amount() == 1) {
            $.ajax({
                type: "POST",
                url: '/deckapi/removeCard',
                data: {id: deckId, cardId: card.id},
                success: function(result) {
                    if (result.status == "error") {
                        alert(result.message);
                    } else if (result.status == "success") {
                        $("." + card.id).remove();
                    }
                },
                error: function (jXHR, textStatus, errorThrown){
                    console.log(errorThrown);
                    console.log(textStatus);
                    console.log(jXHR);
                },
                dataType: "JSON"
            });
        } else {
            $.ajax({
                type: "POST",
                url: '/deckapi/changeCardAmount',
                data: {id: deckId, cardId: card.id, change: "decrease"},
                success: function(result) {
                    if (result.status == "error") {
                        alert(result.message);
                    } else if (result.status == "success") {
                        card.amount(card.amount() - 1);
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
    }

    self.changeCut = function(card) {
        $.ajax({
            type: "POST",
            url: '/deckapi/changeStatus',
            data: {id: deckId, cardId: card.id, change: "cut"},
            success: function(result) {
                if (result.status == "error") {
                    alert(result.message);
                } else if (result.status == "success") {
                    card.cut(!card.cut());
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

    self.changeBuy = function(card) {
        $.ajax({
            type: "POST",
            url: '/deckapi/changeStatus',
            data: {id: deckId, cardId: card.id, change: "buy"},
            success: function(result) {
                if (result.status == "error") {
                    alert(result.message);
                } else if (result.status == "success") {
                    card.buy(!card.buy());
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

    $.ajaxSetup({async:false});
    self.update();
    $.ajaxSetup({async:true});

    self.name(self.jsonData().name);
    self.format(self.jsonData().format);
    self.color(self.jsonData().color);
    self.image(self.jsonData().image);

    self.tempName(self.jsonData().name);
    self.tempFormat(self.jsonData().format);
    self.tempColor(self.jsonData().color); 
    self.tempImage(self.jsonData().image);
    
    if(!self.image() || self.image() == "") {
        self.image('/images/placeholder.png');
    }
}

ko.applyBindings(new DeckViewModel());


// $('form').on('submit', function(e) {
//     e.preventDefault();
// });
// $(".jsAddCardBtn").on("click", function(e) {
//     e.preventDefault();
//     addCard();
// });