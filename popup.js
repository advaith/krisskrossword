
// Content script code - should be moved to a separate js file that listens for existence of native DOM elements
function scrapeThePage() {
	 console.log("scraping the page");
    var visited = window.location.href;
    function checkForChecks() {
      console.log("checking for ... checks????")
      var all_cells = document.getElementsByClassName('Board-svg--34be-')[0].children[2].children
      var checked = 0
      console.log(all_cells)
      Array.from(all_cells).forEach(function(element) {
        if (element.children[0].className['baseVal'].toString().includes('Shame')) {
          checked = 1;
          return checked
        }
      });
      return checked

    }
    // TODO: switch these queries to regexes
    var finishedStatus = document.querySelector("div.Toolbar-resetButton--1bkIx");
    var completed = 0;
    if (finishedStatus) {
    	completed = 1;
    	var date = String(document.URL).substring(46)
	    var timeStatus = document.querySelector("div.timer-count").textContent;
	    var day = document.querySelector("div.PuzzleDetails-date--1HNzj").children[0].textContent.slice(0, -1);
	    console.log("this should be timestatus")
	    console.log(timeStatus)
      var checked = checkForChecks()
      chrome.storage.sync.set({date: date});
      chrome.storage.sync.set({day: day});
	    // Send object to database
	    chrome.runtime.sendMessage({date: date, time: timeStatus, day: day, checked: checked});
      return;
    }
};	 




function loop_de_loop() {
  console.log("LOOP TIME")
  const scriptToExec = `(${scrapeThePage})()`;
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
     console.log(tabs[0]);
     chrome.tabs.executeScript(
        tabs[0].id,
        {code: scriptToExec});
  });
}

// Add friend button listener
// 
let add_friend_button = document.getElementById("add_friend_button")
let add_friend_text = document.getElementById("add_friend_text")
add_friend_button.onclick = function(element) {
  let friendId = add_friend_text.value
  var uid = firebase.auth().currentUser.uid;
  //2writeUserFriend(uid, friendId)
  console.log("Added friend with uid")
  console.log(uid)
  add_friend_text.value = ""
};




// Helper function to get list of friends for a given uid
function getFriendsList(userId) {
  var ref = firebase.database()
  var rootRef = firebase.database().ref('friends');
  var newRoot = rootRef.child(userId);
  return newRoot.once('value').then(function(snapshot){
      friends = [];
      snapshot.forEach(function(_child){
          var friend_name = _child.key;
          friends.push(friend_name + "@gmail.com");
      });
      return friends;
  });
}

// Helper function to get uid from friend google id
function getIdFromEmail(friendEmail) {
  var ref = firebase.database()
  var rootRef = firebase.database().ref('users');
  return rootRef.orderByChild('email').equalTo(friendEmail).once("value").then(function(snapshot) {
        var answer = []
        snapshot.forEach((function(child) { answer.push(child.key) })) 
        return answer[0]
  });
}

// Helper function to get score from uid, date, and day
function getScoreFromId(friendId, date, day) {
  var date_path = date.split("/").join("");
  var rootRef = firebase.database().ref(friendId + "/" + day + "/" + date_path);
  return rootRef.once("value").then(function(snapshot) {
    console.log("the snapshot val is:::::::::::")
    console.log(snapshot.val()) //TODO - exceptio handle here! ! !
    if (snapshot.val() === null) {
      return ["hasn't finished yet", 0]
    } else {
    return [snapshot.val()["time"], snapshot.val()["checked"]]
    }
  });
}

// Background message listener
// Listens for message from content script + sends to database
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    var uid = firebase.auth().currentUser.uid;
    var name = firebase.auth().currentUser.displayName;
    writeUserData(uid, message['day'], message['date'], message['time'], message['checked']);
    getFriendsData(uid, message['day'], message['date'])
});

// Get friends scores
// let friendscores = document.getElementById('get_friend_score');
function getFriendsData(userID, day, date) {
  var ref = firebase.database()
  var friends = getFriendsList(userID)
  var friend_scores = {}
  friends.then(function(friendList) {
    var friendPromises = []
    friendList.forEach(function(friendEmail) { 
      friendPromises.push(getIdFromEmail(friendEmail))
    })
    return Promise.all(friendPromises)
  }).then(function(friendIdsList) {
    var friendScorePromises = []
    friendIdsList.forEach(function(friendId) {
      friendScorePromises.push(getScoreFromId(friendId, date, day))
    })
    var friends = getFriendsList(userID)
    friendScorePromises.push(friends)
    return Promise.all(friendScorePromises)
  }).then(function(friendScores) {
    friendNames = friendScores.pop()
    // make it a dictionary
    if (friendScores === null) {
      console.log("ya they were null")
      document.getElementById('friend-score-details').textContent = "No friends have reported scores yet!";
    } else {
    console.log("here are the FRIENDSCORES")
    console.log(friendScores)
    friendScoresDict = {}
    friendChecksDict = {}
    friendNames.forEach((key, i) => friendScoresDict[key] = friendScores[i][0]);
    friendNames.forEach((key, i) => friendChecksDict[key] = friendScores[i][1]);

    document.getElementById('friend-score-details').textContent = "Friend Scores: " + JSON.stringify(friendScoresDict, null, '  ')
    + "Friend Checks: " + JSON.stringify(friendChecksDict, null, '  ');

    }
    return friendScores
  }).catch(function (err) {
    console.log('err', err);
  });

}

// Database write
// User information --> database entry
function writeUserData(userId, day, date, time, checked) {
  // Argument passed into ref is the path to the database 'file' that you're writing with this info
  // Should reflect predetermined database schema 
  var date_path = date.split("/").join("");
  firebase.database().ref(userId + "/" + day + "/" + date_path).set({
	    time: time,
      checked: checked
  });
  document.getElementById('my-score-details').textContent = "My Score: " + time + " | Checked Status: " + checked; 

  console.log("Finished writing user data to firebase");
}

function writeUserFriend(userId, friendId) {
  // NOTE - cant save periods so must just use gmail
  // Argument passed into ref is the path to the database 'file' that you're writing with this info
  // Should reflect predetermined database schema 
  // TODO: make sure this user even exists before adding it in?!
  friendEmail = friendId + "@gmail.com";
  getIdFromEmail(friendEmail).then(function (friendId) {
    console.log("FRIEND REQUEST ID: ")
    console.log(friendId);
    firebase.database().ref("/friends/" + userId + "/" + friendId).update({
      value: 1
    });
  })
  console.log("Finished writing to firebase");
}

function readUserData(userId, day, date, time) {
  var date_path = date.split("/").join("");
  firebase.database().ref(userId + "/" + day + "/" + date_path).on( 'value', function(snapshot) {
    return snapshot.val();
  });
}

setInterval(loop_de_loop, 3 * 1000)

