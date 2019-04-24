// Content script code - should be moved to a separate js file that listens for existence of native DOM elements
function scrapeThePage() {
   var visited = window.location.href;
	 console.log("scrapeThePage | \t beginning: ", visited);
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
	    // Send object to database
	    chrome.runtime.sendMessage({date: date, time: timeStatus, day: day, checked: checked});
      return 1;
    }
};	


function scrape_url(urls) {
  console.log("scrape_url | urls ", urls)
  url_str = urls.pop();
  console.log("scrape_url | url string", url_str)
  console.log("scrape_url | urls afterwards", urls)
  const scriptToExec = `(${scrapeThePage})()`;
  const urls_arg = urls;
  chrome.tabs.update({url: url_str
    }, function(tab1) {

    // add listener so callback executes only if page loaded. otherwise calls instantly
    var listener = function(tabId, changeInfo, tab) {

        if (tabId == tab1.id && changeInfo.status === 'complete') {
            // remove listener, so only run once
            chrome.tabs.onUpdated.removeListener(listener);
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
               console.log("scrape_url | in the tabs ", urls_arg )
               console.log("scrape_url | in the tabs ", tabs[0] )

               chrome.tabs.executeScript(
                  tabs[0].id,
                  {code: scriptToExec}, function(results) {
                    console.log("scrape_url | results ", results)
                    if (urls_arg.length == 0) {
                      console.log("scrape_url | stopping")
                      return 1;
                     } else {
                      scrape_url(urls_arg);
                     }
                  });
            });
        }
    }
    chrome.tabs.onUpdated.addListener(listener);
  });
}

function getUrlDate(url) {
  url_els = url.split('/')
  n_url_els = url_els.length;
  date_path = url_els.splice(n_url_els-3, n_url_els).join('')
  return date_path
}

function scrape_all_scores() {
  chrome.storage.local.get(null, function(data) {
    stored_keys = Object.keys(data);
    var allUrls = generate_all_urls('daily');
    req_keys = allUrls.map(getUrlDate)
    console.log("scrape_all_scores | all keys", stored_keys)
    console.log("scrape_all_scores | all keys", req_keys)

    filteredUrls = []
    req_keys.forEach(function(req_key, i) {
      if (!stored_keys.includes(req_key)) {
        filteredUrls.push(allUrls[i]);
      }
    })
    console.log("scrape_all_scores | ", filteredUrls)
    scrape_url(filteredUrls)
  })
}

// Background message listener
// Listens for message from content script + sends to database
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    var uid = firebase.auth().currentUser.uid;
    var name = firebase.auth().currentUser.displayName;
    // Check for outlier times and don't write them in the database
    if ((timeStringToFloat(message['time']) > 1.0) && (timeStringToFloat(message['time'] <= 180))){
      writeUserData(uid, message['day'], message['date'], message['time'], message['checked']);
    } else {
      console.log("chrome listener | time is too small or too large")
    }
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

// Scrape button listener
let scrape_button = document.getElementById("scrape-button")
scrape_button.onclick = function(element) {
  scrape_all_scores()
};



function getFriendsData(userID, day, date) {
  console.log("getFriendsData | beginning");
  var ref = firebase.database()
  var friends = getFriendsFromID(userID)
  var friend_scores = {}
  var date = date.split("/").join("")
  friends.then(function(friendList) {
    var friendPromises = []
    friendList.forEach(function(friendEmail) { 
      friendPromises.push(getIdFromEmail(friendEmail))
    })
    return Promise.all(friendPromises)
  }).then(function(friendIdsList) {
    console.log("getFriendsData | friendIds", friendIdsList)
    console.log("getFriendsData | date,day", date, day)
    console.log("getFriendsData | calling getScoreFromId")
    var friendScorePromises = []
    friendIdsList.forEach(function(friendId) {
      friendScorePromises.push(getScoreFromId(friendId, date, day))
    })
    // TODO: explain why these next two lines are here
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
    console.log("getFriendsData | \there are the FRIENDSCORES", friendScores)
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

    // TODO: not sure if we really want a list of everyone's scores in the entire world but it was a nice debugging phase
    //document.getElementById('world-score-details').innerHTML = niceHtml;
    }
    return friendScores
  }).catch(function (err) {
    console.log('getAllData | \terr', err);
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
  obj = {};
  obj[date_path] = time;
  //chrome.local.storage.set(obj);
  console.log("writeUserData | checked val", checked)
  // TODO: would involve storing an extra piece of info in chrome local storage to stop from polling
  // if (checked == 0) {
  //   entry = "💪";
  // } else {
  //   entry = "💩";
  // }
  document.getElementById('my-score-details').textContent = "Time: " + time 

  console.log("writeUserData | \tFinished writing user data to firebase");
}

function writeUserFriend(userId, friendId) {
  // NOTE - cant save periods so must just use gmail
  console.log("writeUserFriend | beginning")
  friendEmail = friendId + "@gmail.com";
  jj = checkIdExists(friendEmail);
  console.log("writeUserFriend | CHECKIDEXISTS VAL ", jj)

  jj.then(function(idexists) {
    if (idexists) {
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
    else {
      add_friend_success_text = document.getElementById("add_friend_success")
      add_friend_success_text.innerHTML = "user not on extension...but you could change that!";
    }
  })
  
}

