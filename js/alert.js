document.addEventListener('DOMContentLoaded', function() {
    fetchMeditationQuote();
});

function fetchMeditationQuote() {
    var category = 'health';
    var apiKey = 'LakbnWoMdZGU/vA9qPo6mA==YC8bE0XscdGJTGO2'; 
    var url = 'https://api.api-ninjas.com/v1/quotes?category=' + category;

    fetch(url, {
        method: 'GET',
        headers: {
            'X-Api-Key': apiKey,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(result => {
        if (result && result.length > 0) {
            const quoteText = result[0].quote;
            const quoteAuthor = result[0].author;
            document.getElementById('meditationQuote').innerHTML = `<span class="quote-text">"${quoteText}"</span><span class="quote-author"> - ${quoteAuthor}</span>`;
        } else {
            document.getElementById('meditationQuote').innerText = 'Refresh to see a peaceful thought.';
        }
    })
    .catch(error => {
        console.error('Error fetching meditation quote:', error);
        document.getElementById('meditationQuote').innerText = 'Take a moment to breathe and relax.';
    });
}


document.getElementById('takeBreakButton').addEventListener('click', function() {
    var userWantsBreak = confirm("Do you want to take a break now?");
    if (userWantsBreak) {
        recordUserChoice(true);
        disableButtons();
    }
});

document.getElementById('skipBreakButton').addEventListener('click', function() {
    var userWantsSkip = confirm("Do you want to skip a break now?");
    if (userWantsSkip) {
        recordUserChoice(false);
        disableButtons();
    }
});

function recordUserChoice(taken) {
    var currentHour = new Date().getHours();
    chrome.storage.local.get({breakStats: {}}, function(items) {
        var breakStats = items.breakStats;
        var currentStat = breakStats[currentHour] || { taken: 0, skipped: 0 };

        if (taken) {
            currentStat.taken += 1;
            showMessage("Enjoy your break!");
        } else {
            currentStat.skipped += 1;
            showMessage("Break skipped. Stay focused!");
        }

        breakStats[currentHour] = currentStat;
        chrome.storage.local.set({breakStats: breakStats}, function() {
            console.log("Break stats updated for hour " + currentHour);
        });
    });

    disableButtons();
}

function showMessage(message) {
    var messageDiv = document.getElementById('userMessage');
    messageDiv.textContent = message;
    messageDiv.style.display = 'block'; 
    setTimeout(function() {
        messageDiv.style.display = 'none'; 
    }, 3000);
}

function disableButtons() {
    document.getElementById('takeBreakButton').disabled = true;
    document.getElementById('takeBreakButton').style.opacity = '0.5';
    document.getElementById('skipBreakButton').disabled = true;
    document.getElementById('skipBreakButton').style.opacity = '0.5';
}

// Function to enable buttons again when needed (e.g., when the alert is displayed again)
function enableButtons() {
    document.getElementById('takeBreakButton').disabled = false;
    document.getElementById('takeBreakButton').style.opacity = '1';
    document.getElementById('skipBreakButton').disabled = false;
    document.getElementById('skipBreakButton').style.opacity = '1';
}

// Call this function to open the break alert tab at the set interval
function openBreakAlert() {
    chrome.storage.local.get({breakInterval: null}, function(data) {
        if (data.breakInterval) {
            // Open a new tab with the break alert page
            chrome.tabs.create({ url: 'path_to/break-alert.html' });
            // Re-enable buttons every time the alert page is opened
            enableButtons();
        }
    });
}

// Event listeners for the buttons on the break alert page
document.getElementById('takeBreakButton').addEventListener('click', function() {
    recordUserChoice(true); // true for taken
});

document.getElementById('skipBreakButton').addEventListener('click', function() {
    recordUserChoice(false); // false for skipped
});