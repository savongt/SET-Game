/*
  * Name: Savong Tan
  * Date: 10/23/2018
  * Section: CSE 154 AC
  * This program implements a new set game in which a user tries to match cards
  * in where attributes are all the same or not. It keeps track of how many sets
  * they found, and times them with a penalty added for each incorrect guess.
  */

(function() {
    "use strict";
    const STYLE = ["outline", "solid", "striped"];
    const SHAPES = ["diamond", "oval", "squiggle"];
    const COLORS = ["green", "purple", "red"];
    let currSetCount = 0; // current setCount for the current game
    let selected = 0; // current number of selected cards
    let timer = null; // timer for a single game
    let startingTime = 0; // either time remaining or amount of time that has
                          // passed(unlimited)
    let unlimited; // if game is timed(false) or unlimited(true)
    let standard; // if game is easy(false) or standard(true)
    let maxCards; // max number of cards in the game

    /**
     * Sets up functionality for the start game button, and the back button.
     */
    window.onload = function() {
        $("start").addEventListener("click", startGame);
        $("main-btn").addEventListener("click", backToMain);
    }

    /**
     * Begins a new game from the chosen difficuly, resetting the timer, adding cards
     * and adding function to the refresh button. Resets the set count.
     */
    function startGame() {
        getDifficulty();
        startTimer();
        addCards();
        $("refresh").addEventListener("click", addCards);
        toggleGame();
        currSetCount = 0;
        $("set-count").innerHTML = currSetCount;
        deselectAll();
    }

    /**
     * Keeps track of the time for the user in a MM:SS format.
     * If the number ever goes below 10 seconds, show remaining seconds properly
     * If the time ever reaches 0, show 0:00.
     */
    function formatTime(seconds) {
        let minutes = Math.floor(seconds / 60);
        seconds = seconds % (60);
        if (seconds > 9) {
            $("time").innerHTML = minutes + ":" + seconds;

        } else if (seconds > 0) {
            $("time").innerHTML = minutes + ":0" + seconds;
        } else {
            $("time").innerHTML = "0:00";
        }
    }

    /**
     * Begins the timer based on the user input and updates the time every
     * second. If the time ever gets to 0 or below, end the game.
     */
    function startTimer() {
        startingTime = qs("select").value;
        if (startingTime == "none") {
            unlimited = true;
            startingTime = 0;
            timer = setInterval(function() {
                startingTime++;
                formatTime(startingTime);

            }, 1000);

        } else {
            startingTime = parseInt(qs("select").value);
            timer = setInterval(function() {
                if (startingTime < 0) {
                    console.log(startingTime);
                    gameEnd();
                } else {
                    startingTime--;
                    formatTime(startingTime);
                }
            }, 1000);
        }

    }

    /**
     * Switch from the main view to the game view
     */

    function toggleGame() {
        $("game-view").classList.remove("hidden");
        $("menu-view").classList.add("hidden");
        $("menu-view").setAttribute("display", "none");

    }

    /**
     * Puts brand new cards in the game depending on the difficulty.
     */
    function addCards() {
        $("game").innerHTML = "";
        let i;
        for (i = 0; i < maxCards; i++) {
            makeCard();
        }
    }

    /**
     * Makes a brand new card with a random design and gives the card functionality
     * then adds the card to the game
     */
    function makeCard() {
        let card = document.createElement("div");
        card.classList.add("card");
        getRandomDesign(card);
        card.addEventListener("click", cardSelect);
        $("game").append(card);
    }

    /**
     * Get whether the game is easy or standard from user input
     * assign the max number of cards accordingly.
     */
    function getDifficulty() {
        let diff = qs("input[name='diff']:checked").value;
        if (diff == "standard") {
            standard = true;
            maxCards = 12;
        } else if (diff == "easy") {
            standard = false;
            maxCards = 9;
        }
        return standard;
    }

    /**
     * Gets a random design for the card, depending on difficulty set style to only
     * solids or not. Check if the card already exists in the game, and reroll for
     * a new design if it does, or add the design to the card if it doesn't
     */
    function getRandomDesign(card) {
        let qty = parseInt(Math.random() * 3) + 1;
        let style;
        if (standard) {
            style = STYLE[parseInt(Math.random() * 3)];
        } else {
            style = "solid";
        }

        let shape = SHAPES[parseInt(Math.random() * 3)];
        let color = COLORS[parseInt(Math.random() * 3)];
        let i;
        let cardID = $(style + "-" + shape + "-" + color + "-" + qty);
        if (cardID) {
            card.innerText = "";
            getRandomDesign(card);
        } else {
            for (i = 0; i < qty; i++) {
                let shapes = document.createElement("img");
                card.setAttribute("id", style + "-" + shape + "-" + color + "-" + qty);
                shapes.setAttribute("src", "img/" + style + "-" + shape + "-" + color + ".png");
                shapes.setAttribute("alt", style + "-" + shape + "-" + color + ".png");
                card.appendChild(shapes);
            }
        }

    }

    /**
     * Ends the game and switches back to the main menu view
     */
    function backToMain() {
        clearInterval(timer);
        $("game-view").classList.add("hidden");
        $("menu-view").classList.remove("hidden");
    }

    /**
     * If card is selected, change the style of it and add to the selected
     * card count, if specific card is already selected deselect it.
     * If three cards are selected, check if the cards are a set and add it
     * the set count. Display a message on the cards indicating if it's a set or not.
     * Check the time and give the user a penalty of 15 seconds.
     * If the time with the penalty is less than 0, end the game.
     * Deselect all cards after 3 are chosen and checked.
     */
    function cardSelect() {
        let i;
        if (this.classList.contains("selected")) {
            selected--;
            this.classList.remove("selected");
        } else if (selected <= 2) {
            selected++;
            this.classList.add("selected");
        }
        if (selected === 3) {
            let selectedCards = qsa(".selected");
            let isSet = checkSame(selectedCards);
            if (isSet === true) {
                currSetCount++;
                for (i = 0; i < 3; i++) {
                    showTempMessage(selectedCards[i], "SET!");
                }
                $("set-count").innerHTML = currSetCount;
            } else {
                for (i = 0; i < 3; i++) {
                    showTempMessage(selectedCards[i], "Not a Set :(");
                }
                if (unlimited) {
                    startingTime += 15;
                } else {
                    if (startingTime - 15 > 0) {
                        startingTime -= 15;
                    } else {
                        gameEnd();
                    }
                }
            }
        }
    }

    /**
     * Deselects all currently selected cards
     */
    function deselectAll() {
        selected = 0;

        let selectedCards = qsa(".selected");
        let i;
        for (i = 0; i < selectedCards.length; i++) {
            selectedCards[i].classList.remove("selected");
        }
    }

    /**
     * Shows a message on each selected card for one second, then deselect them.
     */
    function showTempMessage(card, myMsg) {
        card.innerText = myMsg;
        setTimeout(function() {
            card.innerText = "";
            deselectAll();
            getRandomDesign(card);
        }, 1000);
    }

    /**
     * Ends the game, clears the timer and sets the time to stay at 0:00.
     * Do not allow the user to select any more cards when time is up
     * Deselect any currently selected cards
     */
    function gameEnd() {
        startingTime = 0;
        formatTime(startingTime);
        clearInterval(timer);
        let currentCards = qsa(".card");
        let i;
        for (i = 0; i < currentCards.length; i++) {
            currentCards[i].removeEventListener("click", cardSelect, false);
        }
        $("refresh").onclick = function() {
            return false;
        };
        deselectAll();

    }

    /**
     * Checks if all of the selected cards are a set, as in if all 3 have a matching
     * attribute or all 3 don't match for all four attributes.
     */
    function checkSame(selected) {
        let card1id = selected[0].id.split("-");
        let card2id = selected[1].id.split("-");
        let card3id = selected[2].id.split("-");
        let isSet = false;
        let i;
        for (i = 0; i < card1id.length; i++) {
            if ((card1id[i] === card2id[i]) && (card2id[i] === card3id[i]) && (card1id[i] === card3id[i]) ||
                (card1id[i] !== card2id[i]) && (card2id[i] !== card3id[i]) && (card1id[i] !== card3id[i])) {
                isSet = true;
            } else {
                return false;
            }
        }
        return isSet;
    }

    /**
     * Returns the first element that matches the given ID
     * @param {string} id - element ID
     * @returns {object[]} array of DOM objects with the associated ID
     */
    function $(id) {
        return document.getElementById(id);
    }

    /**
     * Returns the first element that matches the given CSS selector.
     * @param {string} id - element ID
     * @returns {object[]} array of DOM objects with the associated ID
     */
    function qs(query) {
        return document.querySelector(query);
    }
    /**
     * Returns the array of elements that match the given CSS selector
     * @param {string} query - CSS query selector
     * @returns {object[]} array of DOM objects matching the query
     */
    function qsa(query) {
        return document.querySelectorAll(query);
    }

})();
