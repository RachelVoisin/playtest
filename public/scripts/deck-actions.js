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

    $('form').on('submit', function(e) {
        e.preventDefault();
    });

    // Add New Card to Deck
    $(".jsAddCardBtn").on("click", function(e) {
        e.preventDefault();
        addCard();
    });
    $(".jsAddCardText").on("keyup", function(e) {
        if (e.keyCode == 13){
            addCard();
        }
    });

    // Preform Card Mass Actions 

    // Change Card Amount 
});