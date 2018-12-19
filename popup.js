// Content script code - should be moved to a separate js file that listens for existence of native DOM elements
function scrapeThePage() {
	console.log("huhhasfhlhsdf");
    var visited = window.location.href;

    // TODO: switch these queries to regexes
    var finishedStatus = document.querySelector("div.Toolbar-resetButton--1bkIx");
    var completed = 0;
    if (finishedStatus) {
    	completed = 1;
    	var key = String(document.URL).substring(46)
	    var timeStatus = document.querySelector("div.timer-count").textContent;
	    var day = document.querySelector("div.PuzzleDetails-date--1HNzj").children[0].textContent.slice(0, -1);
	    console.log("this should be timestatus")
	    console.log(timeStatus)

	    // Send object to database
	    chrome.runtime.sendMessage({date: key, time: timeStatus, day: day});
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
    writeUserData(uid, message['day'], message['date'], message['time']);
});


// Database write
// User information --> database entry
function writeUserData(userId, day, date, time) {
  // Argument passed into ref is the path to the database 'file' that you're writing with this info
  // Should reflect predetermined database schema 
  var date_path = date.split("/").join("");
  firebase.database().ref(userId + "/" + day + "/" + date_path).set({
	    time: time
  });
  console.log("Finished writing to firebase");
}
