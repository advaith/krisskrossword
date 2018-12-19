let changeColor = document.getElementById('changeColor');
let finishedStatus = document.querySelector("div.Toolbar-resetButton--1bkIx");
console.log(finishedStatus)


function scrapeThePage() {
	console.log("huhhasfhlhsdf");
    var visited = window.location.href;
    var finishedStatus = document.querySelector("div.Toolbar-resetButton--1bkIx");
    var completed = 0;
    if (finishedStatus) {
    	completed = 1;
    	var key = String(document.URL).substring(46)
    	var key_completed = key + "_completed"
    	var key_time = key + "_time"
    	console.log("THE KEY IS")
    	console.log(key)
	    var timeStatus = document.querySelector("div.timer-count").textContent;
	    console.log("this should be timestatus")
	    console.log(timeStatus)
	    completed_obj = {};
	    completed_obj[key_completed] = completed
	    time_obj = {};
	    time_obj[key_time] = timeStatus

	    // Send object to database
	    chrome.runtime.sendMessage({date: key, time: timeStatus});
	    chrome.storage.sync.set(completed_obj, function () {});
	    chrome.storage.sync.set(time_obj, function () {});
    }
};	

(function () {
    chrome.storage.onChanged.addListener(function (changes,areaName) {
    	
    	// console.log("New thing in storage",changes.asdf.newValue);
     //    console.log("New item in storage",changes.sdfg);
    })
})();

changeColor.onclick = function(element) {
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

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    alert("message received");
    console.log(message['date']);
    console.log(message['time']);
    var uid = firebase.auth().currentUser.uid;
    var name = firebase.auth().currentUser.displayName;
    writeUserData(uid, name, message['date'], message['time'])
    console.log("message received");
});


function writeUserData(userId, name, date, time) {
  firebase.database().ref('users/' + userId).set({
	    username: name,
	    date: date,
	    time: time
  });
  console.log("written to the database???");
}