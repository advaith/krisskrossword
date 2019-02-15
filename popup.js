
// Content script code - should be moved to a separate js file that listens for existence of native DOM elements
function scrapeThePage() {
	 console.log("scrapeThePage | \t beginning");
    var visited = window.location.href;
    function checkForChecks() {
      console.log("scrapeThePage | \t checking for ... checks????")
      var all_cells = document.getElementsByClassName('Board-svg--34be-')[0].children[2].children
      var checked = 0
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
	    console.log("scrapeThePage | \t timestatus: " + timeStatus)
      var checked = checkForChecks()
      chrome.storage.sync.set({date: date});
      chrome.storage.sync.set({day: day});
	    // Send object to database
	    chrome.runtime.sendMessage({date: date, time: timeStatus, day: day, checked: checked});
      return;
    }
};	


function loop_de_loop() {
  console.log("loop_de_loop | starting");
  const scriptToExec = `(${scrapeThePage})()`;
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
     chrome.tabs.executeScript(
        tabs[0].id,
        {code: scriptToExec});
  });
}

// Background message listener
// Listens for message from content script + sends to database
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    var uid = firebase.auth().currentUser.uid;
    var name = firebase.auth().currentUser.displayName;
    writeUserData(uid, message['day'], message['date'], message['time'], message['checked']);
    getFriendsData(uid, message['day'], message['date'])
    getAllData(uid, message['day'], message['date'])
});
 


// Add friend button listener
let add_friend_button = document.getElementById("add_friend_button")
let add_friend_input = document.getElementById("add_friend_input")
add_friend_button.onclick = function(element) {
  let friendId = add_friend_input.value
  var uid = firebase.auth().currentUser.uid;
  writeUserFriend(uid, friendId)
  add_friend_input.value = ""
};




// Helper function to get list of friends for a given uid
function getFriendsFromID(userId) {
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

function getAllEmails() {
  var ref = firebase.database()
  var newRoot = firebase.database().ref('users');
  // var newRoot = rootRef.child(userId);
  return newRoot.once('value').then(function(snapshot){
      friends = [];
      snapshot.forEach(function(_child){
        var friend_name = _child.key;
        friends.push(_child.val()['email']);
      });
      console.log("getAllEmails | \t friends", friends)
      return friends;
  });
}


function getAllNames() {
  var ref = firebase.database()
  var newRoot = firebase.database().ref('users');
  // var newRoot = rootRef.child(userId);
  return newRoot.once('value').then(function(snapshot){
      friends = [];
      snapshot.forEach(function(_child){
        var friend_name = _child.key;
        friends.push(_child.val()['name']);
      });
      console.log("getAllEmails | \t friends", friends)
      return friends;
  });
}

// Helper function to get score from uid, date, and day
function getScoreFromId(friendId, date, day) {
  var date_path = date.split("/").join("");
  var rootRef = firebase.database().ref(friendId + "/" + day + "/" + date_path);
  return rootRef.once("value").then(function(snapshot) {
    console.log("getScoreFromId | \t the snapshot val is:::::::::::")
    console.log("getScoreFromId | \t" + snapshot.val()) //TODO - exception handle here! ! !
    if (snapshot.val() === null) {
      return ["hasn't finished yet", 0]
    } else {
    return [snapshot.val()["time"], snapshot.val()["checked"]]
    }
  });
}


function getEmailFromId(friendID) {
  var ref = firebase.database()
  var rootRef = firebase.database().ref('users/' + friendID);
  console.log("getEmailFromId | \t GETTING EMAIL FOR: ", friendID)

  return rootRef.once('value').then(function(snapshot) {
    email = snapshot.child("email").val()

    console.log("getEmailFromId | \t EMAIL: ", email)
    return email;
  })
};


function getIdFromEmail(friendEmail) {
  console.log("getIdFromEmail | \t beginning FOR MY DEAR FRIEND:", friendEmail)
  var ref = firebase.database()
  var rootRef = firebase.database().ref('users');

  return rootRef.orderByChild('email').equalTo(friendEmail).once("value").then(function(snapshot) {
        poss_user_ids = []
        snapshot.forEach((function(child) {
          poss_user_ids.push(child.key)
        })) 
        console.log("getIdFromEmail | \t poss_user_ids: ", poss_user_ids)
        return [poss_user_ids[0]]
  }).then(function(poss_users) {
      poss_user_promises = []
      poss_users.forEach(function(poss_user) {
        poss_user_promises.push(getEmailFromId(poss_user))
      })
      console.log("getIdFromEmail | \t poss user id second promise: ", poss_users[0])
      poss_user_promises.push(poss_users[0])
      return Promise.all(poss_user_promises)
  }).then(function(final_elements) {
      poss_user_id = final_elements.pop()
      final_emails = final_elements[0]

      console.log("getIdFromEmail | \tfinal_email: ", final_emails)
      console.log("getIdFromEmail | \t poss_user_id: ", poss_user_id)
      if(final_emails === null) {
        console.log("getIdFromEmail | \t invalid friend")
        //return "invalid friend"
      } else {
        return poss_user_id
      }
  });
}


function getFriendsData(userID, day, date) {
  console.log("getFriendsData | beginning");
  var ref = firebase.database()
  var friends = getFriendsFromID(userID)
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
    var friends = getFriendsFromID(userID)
    friendScorePromises.push(friends)
    return Promise.all(friendScorePromises)
  }).then(function(friendScores) {
    friendNames = friendScores.pop()
    // make it a dictionary
    if (friendScores === null) {
      console.log("getFriendsData | \t ya they were null")
      document.getElementById('friend-score-details').textContent = "No friends have reported scores yet!";
    } else {
    console.log("getFriendsData | \there are the FRIENDSCORES")
    console.log(friendScores)
    friendScoresDict = {}
    friendChecksDict = {}
    friendNames.forEach((key, i) => friendScoresDict[key] = friendScores[i][0]);
    friendNames.forEach((key, i) => friendChecksDict[key] = friendScores[i][1]);
    niceHtml = dict_to_table(friendScoresDict, friendChecksDict)
    // document.getElementById('friend-score-details').textContent = "Friend Scores: " + JSON.stringify(friendScoresDict, null, '  ')
    // + "Friend Checks: " + JSON.stringify(friendChecksDict, null, '  ');
    document.getElementById('friend-score-details').innerHTML = niceHtml;
    }
    return friendScores
  }).catch(function (err) {
    console.log('getFriendsData | \terr', err);
  });

}

// function convertTimeStringtoSeconds(time) {
//   var minutes = int(time[0:2])
//   var seconds = int(time[3:])
//   var time = (minutes * 60) + seconds
//   return time
// }


function getAllData(userID, day, date) {
  console.log("getAllData | beginning");
  var ref = firebase.database()
  var friends = getAllEmails()
  var friend_scores = {}
  friends.then(function(friendList) {
    console.log("getAllData | Friends email list: \t", friendList)
    var friendPromises = []
    friendList.forEach(function(friendEmail) { 
      friendPromises.push(getIdFromEmail(friendEmail))
    })
    return Promise.all(friendPromises)
  }).then(function(friendIdsList) {
    console.log("getAllData | Friends ID list: \t", friendIdsList)
    var friendScorePromises = []
    friendIdsList.forEach(function(friendId) {
      friendScorePromises.push(getScoreFromId(friendId, date, day))
    })
    var allNames = getAllNames();
    friendScorePromises.push(allNames);
    return Promise.all(friendScorePromises)
  }).then(function(friendScores) {
    friendNames = friendScores.pop()
    console.log("getAllData | Friend scores: ", friendScores)
    // make it a dictionary
    if (friendScores === null) {
      console.log("getAllData | \t ya they were null")
      document.getElementById('world-score-details').textContent = "No users in the WHOLE WORLD have reported scores yet!";
    } else {
    console.log("getAllData | \there are the FRIENDSCORES", friendScores)
    friendScoresDict = {}
    friendChecksDict = {}
    friendNames.forEach((key, i) => friendScoresDict[key] = friendScores[i][0]);
    friendNames.forEach((key, i) => friendChecksDict[key] = friendScores[i][1]);
    niceHtml = dict_to_table(friendScoresDict, friendChecksDict)
    // document.getElementById('friend-score-details').textContent = "Friend Scores: " + JSON.stringify(friendScoresDict, null, '  ')
    // + "Friend Checks: " + JSON.stringify(friendChecksDict, null, '  ');
    console.log("THE REAL QUEDSTION IS?!?") 
    console.log(niceHtml)
    document.getElementById('world-score-details').innerHTML = niceHtml;
    }
    return friendScores
  }).catch(function (err) {
    console.log('getAllData | \terr', err);
  });

}




function dict_to_table(scoreDict, checkDict) {
  var html = '<table style="width:100%">'
  html += '<tr>'
  html += '<th>Name</th>'
  html += '<th>Time</th>' 
  html += '<th>Checked Status</th>'
  html += '</tr>'

  for(var uid in scoreDict) {
    html += '<tr>'
    var score = scoreDict[uid]
    var check = checkDict[uid]
    html += '<td>' + uid + '</td>'
    html += '<td>' + score + '</td>'
    html += '<td>' + check + '</td>'
    html += '</tr>'
  }
  html += '</table>'
  return html
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

  console.log("writeUserData | \tFinished writing user data to firebase");
}

function writeUserFriend(userId, friendId) {
  // NOTE - cant save periods so must just use gmail
  console.log("writeUserFriend | beginning")
  friendEmail = friendId + "@gmail.com";
  idEmailPromises = [getIdFromEmail(friendEmail)];

  Promise.all(idEmailPromises).then(function (element) {
    //console.log("writeUserFriend | beginning: ", element);
    add_friend_success_text = document.getElementById("add_friend_success")
    if (element[0] === "invalid friend") {
      add_friend_success_text.innerHTML = "User does not exist"
    } else {
      firebase.database().ref("/friends/" + userId + "/" + friendId).update({
        value: 1
      });
      add_friend_success_text.innerHTML = "Success!";
    }
    
  })
}


setInterval(loop_de_loop, 3 * 1000)

