function loadReminderTime() {
    chrome.storage.local.get(['hours', 'minutes'], function(data) {
        const hoursInput = document.getElementById('hoursInput');
        const minutesInput = document.getElementById('minutesInput');
        const confirmation = document.getElementById('confirmation');

        hoursInput.value = data.hours || 0;
        minutesInput.value = data.minutes || 0;

        if (data.hours !== undefined || data.minutes !== undefined) {
            confirmation.textContent = `Current reminder is set to: ${data.hours || 0} hours and ${data.minutes || 0} minutes.`;
            confirmation.style.display = 'block';
            document.getElementById('updateTime').style.display = 'inline-block';
            document.getElementById('setTime').style.display = 'none';
        } else {
            confirmation.style.display = 'none';
            document.getElementById('setTime').style.display = 'inline-block';
            document.getElementById('updateTime').style.display = 'none';
        }
    });
}

function isValidInput(hoursValue, minutesValue) {
    if (hoursValue === 0 && minutesValue === 0) {
        alert("Both hours and minutes cannot be zero.");
        return false;
    }
    if ((hoursValue * 60 + minutesValue) < 1) {
        alert("Total time should be at least 1 minute.");
        return false;
    }
    if (minutesValue > 59) {
        alert("Minutes should be less than 60.");
        return false;
    }
    return true;
}

function saveReminderTime(hours, minutes) {
    chrome.storage.local.set({ hours, minutes }, function() {
        const confirmation = document.getElementById('confirmation');
        confirmation.textContent = `Reminder set to ${hours} hours and ${minutes} minutes.`;
        confirmation.style.display = 'block';
        setTimeout(() => confirmation.style.display = 'none', 3000);
        loadReminderTime();
        clearInputFields();
        storeBreakDetails(hours, minutes);
    });
}

function clearInputFields() {
    document.getElementById('hoursInput').value = "";
    document.getElementById('minutesInput').value = "";
}

// Event listeners for setting and updating reminder time
document.getElementById('setTime').addEventListener('click', function(event) {
    event.preventDefault();
    handleReminderTimeSetting();
});

document.getElementById('updateTime').addEventListener('click', function(event) {
    event.preventDefault();
    handleReminderTimeSetting();
});

function handleReminderTimeSetting() {
    const hours = parseInt(document.getElementById('hoursInput').value, 10) || 0;
    const minutes = parseInt(document.getElementById('minutesInput').value, 10) || 0;

    if (isValidInput(hours, minutes)) {
        const totalMinutes = (hours * 60) + minutes;
        chrome.runtime.sendMessage({ action: "SET_REMINDER", value: totalMinutes });
        saveReminderTime(hours, minutes);
    }
}

function checkInputValue(inputElement) {
    if (inputElement && inputElement.nextElementSibling) {
        const label = inputElement.nextElementSibling;
        label.classList.toggle('has-value', inputElement.value !== "");
    }
}


document.addEventListener('DOMContentLoaded', function() {
    loadReminderTime();
    clearInputFields(); 
    const hoursInput = document.getElementById('hoursInput');
    const minutesInput = document.getElementById('minutesInput');
    checkInputValue(hoursInput);
    checkInputValue(minutesInput);
    hoursInput.addEventListener('input', () => checkInputValue(hoursInput));
    minutesInput.addEventListener('input', () => checkInputValue(minutesInput));
});

function storeBreakDetails(hours, minutes) {
    const currentTime = new Date();
    const formattedTime = `${currentTime.getFullYear()}-${currentTime.getMonth() + 1}-${currentTime.getDate()} ${currentTime.getHours()}:${currentTime.getMinutes()}`;
    const breakDetail = { time: formattedTime, hours, minutes, reminders: 0 };
    chrome.storage.local.get(['breaks'], function(data) {
        let breaks = data.breaks || [];
        breaks.push(breakDetail);
        chrome.storage.local.set({ breaks });
    });
}

function generateReport() {
    chrome.storage.local.get(['breaks'], function(data) {
        let report = "Break Report:\n";
        (data.breaks || []).forEach(b => {
            const duration = `${b.hours} hours and ${b.minutes} minutes`;
            report += `Date & Time: ${b.time}, Duration: ${duration}, Reminders: ${b.reminders}\n`;
        });
        alert(report);
    });
}

document.getElementById('generateReport').addEventListener('click', function() {
    chrome.tabs.create({ url: '/html/report.html' });
});
