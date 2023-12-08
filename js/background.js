const showAlertTab = () => {
    const alertUrl = chrome.runtime.getURL('/html/alert.html');
  
    chrome.tabs.query({ url: alertUrl }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.update(tabs[0].id, { active: true });
      } else {
        chrome.tabs.create({ url: alertUrl });
      }
    });
  };
  

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Received message in background:", message);

    if (message.action === "SET_REMINDER") {
        const reminderTime = message.value;

        // Clear any existing alarm
        chrome.alarms.clear("breakAlarm", (wasCleared) => {
            // Create a new periodic alarm
            chrome.alarms.create("breakAlarm", { periodInMinutes: reminderTime });
            console.log("Alarm set for every", reminderTime, "minutes");
        });
    }
});

// Initialize an object to store the alert counts for each hour
let alertCountsByHour = {};

chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === "breakAlarm") {
        const currentHour = new Date().getHours();
        
        if (currentHour === 0) {
            alertCountsByHour = {};
        }

        if (!alertCountsByHour[currentHour]) {
            alertCountsByHour[currentHour] = 0;
        }
        alertCountsByHour[currentHour]++;

        chrome.storage.local.set({ alertCountsByHour: alertCountsByHour });

        showAlertTab();
    }
});