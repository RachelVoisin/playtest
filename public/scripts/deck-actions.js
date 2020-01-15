function Card(card) {
    var self = this;
    self.id = card.id;
    self.name = card.name;
    self.amount = ko.observable(card.amount);
    self.cut = ko.observable(card.cut);
    self.buy = ko.observable(card.buy);
}

function DeckViewModel() {
    var self = this;

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const deckId = urlParams.get('deck');
    
    self.name = ko.observable();
    self.format = ko.observable();
    self.jsonData = ko.observable();
    //self.cards = ko.observableArray([]);

    self.cards = ko.computed(function() {
        if(self.jsonData()) {
            var cards = [];

            self.jsonData().deckCards.forEach(function(card) {
                cards.push(new Card(card));
            });

            return cards;
        }
    }, this);

    self.enteredName = function() {
        var e = window.event;
        if (e.keyCode == 13){
            self.addCard();
        }
    }

    self.update = function() {
        $.ajax({
            type: "GET",
            url: '/deckapi/getDeck?id=' + deckId,
            success: function(result) {
                if (result.status == "error") {
                    alert(result.message);
                } else if (result.status == "success") {
                    self.jsonData(result.data);
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
                url: '/deckapi/addCard',
                data: {id: deckId, name: newCardName},
                success: function(result) {
                    if (result.status == "error") {
                        alert(result.message);
                    } else if (result.status == "success") {
                        $("#jsCardInput").val("");
                        self.update();
                        // can I avoid update? Can I use objSort directly in here?
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
        var newDeckName = $(".jsDeckName").val();
        var newDeckFormat = $(".jsFormat").val();

        if(!(newDeckName && newDeckName.length > 0)) {
            newDeckName = self.name();
        }

        $.ajax({
            type: "POST",
            url: '/deckapi/editDetails',
            data: {id: deckId, name: newDeckName, format: newDeckFormat},
            success: function(result) {
                if (result.status == "error") {
                    alert(result.message);
                } else if (result.status == "success") {
                    self.name(newDeckName);
                    self.format(newDeckFormat);
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
        var action = $(".jsCardAction").val();

        var checkboxes = $(".cardCheckbox");
        var checkboxesChecked = [];

        for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                checkboxesChecked.push(checkboxes[i].value);
            }
        }

        if (checkboxesChecked.length > 0) {
            $.ajax({
                type: "POST",
                url: '/deckapi/editCards',
                data: {id: deckId, action: action, cards: checkboxesChecked},
                success: function(result) {
                    if (result.status == "error") {
                        alert(result.message);
                    } else if (result.status == "success") {
                        self.update();
                        // any way to avoid full reload?
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

    self.cancelEditDetails = function() {
        // should probably just put this inline
    }

    $.ajaxSetup({async:false});
    self.update();
    self.name(self.jsonData().name);
    self.format(self.jsonData().format);
    $.ajaxSetup({async:true});
}

ko.applyBindings(new DeckViewModel());








$( document ).ready(function() {
    function addCard() {
        var card = $(".jsAddCardText").val();
        var action = $(".jsAddCardForm").prop('action');
        if (card && card != "") {
            $.ajax({
                type: "POST",
                url: action,
                data: $(".jsAddCardForm").serialize(),
                success: function(result){ 
                    if (result.status == "error") {
                        alert(result.message);
                    } else if (result.status == "success") {
                        if (result.duplicate == true) {
                            console.log(".js" + result.card.id + "Number");
                            $(".js" + result.card.id + "Number").val(result.card.number);
                        } else if (result.duplicate == false) {
                            newRow = document.createElement("TR");
                            newRow.innerHTML = "<td>" + result.card.name + "</td>";
                            $("#jsCardList").append(newRow);
                        }
                    }
                },
                error:function (jXHR, textStatus, errorThrown){
                    console.log(errorThrown);
                    console.log(textStatus);
                    console.log(jXHR);
                },
                dataType: "JSON"
            });
        }
    }

    // $('form').on('submit', function(e) {
    //     e.preventDefault();
    // });
    // $(".jsAddCardBtn").on("click", function(e) {
    //     e.preventDefault();
    //     addCard();
    // });
});