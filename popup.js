chrome.storage.local.clear();


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
	    var timeStatus = document.querySelector("div.timer-count").textContent;
	    console.log("this should be timestatus")
	    console.log(timeStatus)
	    chrome.storage.sync.set({'asdf': completed}, function () {});
	    chrome.storage.sync.set({'sdfg': timeStatus}, function () {});
    }

    // get data and day and make informative key instead of a
};	

(function () {
    chrome.storage.onChanged.addListener(function (changes,areaName) {
    	console.log("New thing in storage",changes.asdf.newValue);
        console.log("New item in storage",changes.sdfg);
    })
})();

changeColor.onclick = function(element) {
	console.log("ok ya")
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
