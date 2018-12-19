// Content script code - should be moved to a separate js file that listens for existence of native DOM elements
function scrapeThePage() {
	console.log("huhhasfhlhsdf");
    var visited = window.location.href;
    var finishedStatus = document.querySelector("div.Toolbar-resetButton--1bkIx");
    var completed = 0;
    if (finishedStatus) {
    	completed = 1;
    	var key = String(document.URL).substring(46)
	    var timeStatus = document.querySelector("div.timer-count").textContent;
	    console.log("this should be timestatus")
	    console.log(timeStatus)

	    // Send object to database
	    chrome.runtime.sendMessage({date: key, time: timeStatus});
    }
};	


let report = document.getElementById('report');

// Report button listener
// Injects scraping content script upon click
report.onclick = function(element) {
	let color = element.target.value;
	const scriptToExec = `(${scrapeThePage})()`;
	console.log(scriptToExec)
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	   console.log(tabs[0]);
	   // console.log()
	   chrome.tabs.executeScript(
	      tabs[0].id,
	      {code: scriptToExec});
	});
};

// Background message listener
// Listens for message from content script + sends to database
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log(message['date']);
    console.log(message['time']);
    var uid = firebase.auth().currentUser.uid;
    var name = firebase.auth().currentUser.displayName;
    writeUserData(uid, name, message['date'], message['time']);
});


// Database write
// User information --> database entry
function writeUserData(userId, name, date, time) {
  // Argument passed into ref is the path to the database 'file' that you're writing with this info
  // Should reflect predetermined database schema 
  firebase.database().ref('users/' + userId).set({
	    username: name,
	    date: date,
	    time: time
  });
  console.log("Finished writing to firebase");
}