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

function getAllIds() {
  var ref = firebase.database()
  var newRoot = firebase.database().ref('users');
  // var newRoot = rootRef.child(userId);
  return newRoot.once('value').then(function(snapshot){
      friends = [];
      snapshot.forEach(function(_child){
        var friend_id = _child.key;
        friends.push(friend_id);
      });
      console.log("getAllIds | \t friends", friends)
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


function getTimesFromDay(day, include_checked=false, uid=null) { 
  console.log("getTimesFromDay | " + day)
  console.log("getTimesFromDay | uid ", uid)

  var ref = firebase.database()
  if (uid === null) {
    uid = firebase.auth().currentUser.uid;
  }
  console.log("getTimesFromDay | uid ", uid)
  var newRoot = firebase.database().ref(uid + '/' + day);
  // var newRoot = rootRef.child(userId);
  return newRoot.once('value').then(function(snapshot){
      times = [];
      snapshot.forEach(function(_child){
        var friend_name = _child.key;
        if (include_checked || _child.val()['checked'] === 0) {
          times.push(_child.val()['time']);
        }
      });
      // console.log("getTimesFromDay | \t times", day,  times)
      return times;
  });
}



function drawHistogram(include_checked=false) {
  console.log("drawHistogram | beginning")
  var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  day_promises = []
  days.forEach(function(day) {
    day_promises.push(getTimesFromDay(day, include_checked))
  }) 
  console.log(day_promises);
  Promise.all(day_promises).then(function(data) {
    // restructure all the data into a list of dictionaries
    // TODO this is where the graphing function should happen, once the data is all resolved
    data_dicts = [];
    data.forEach(function (times, i) {
      var day = days[i]
      times.forEach(function(time) {
        data_dicts.push({'Name': day, 'Value': timeStringToFloat(time)})
      })
    })
    console.log("drawHistogram | ", data_dicts);
    alltime = 0
    for(var i=0, l = data_dicts.length; i < l; i++){
      alltime += data_dicts[i]['Value']
    }
    console.log("drawHistogram | total time: ", alltime)
    drawHistogramD3(data_dicts)

  })
}

function drawBoxplot(include_checked=true) {
  console.log("drawBoxplot | beginning");
  
  var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  day_promises = []
  days.forEach(function(day) {
    day_promises.push(getTimesFromDay(day, include_checked))
  }) 
  console.log(day_promises);
  Promise.all(day_promises).then(function(data) {
    // restructure all the data into a list of dictionaries
    // TODO this is where the graphing function should happen, once the data is all resolved
    groupCounts = {};
    globalCounts = []
    days.forEach(function(day) {
      groupCounts[day.substring(0, 2)] = [];
    })
    
    data.forEach(function (times, i) {
      var day = days[i]
      times.forEach(function(time) {
        groupCounts[day.substring(0, 2)].push(timeStringToFloat(time));
        globalCounts.push(timeStringToFloat(time));
      })
    })

    days.forEach(function(day) {
      if (groupCounts[day.substring(0, 2)].length === 0) {
        groupCounts[day.substring(0, 2)].push(0);
      }
    })
    console.log("drawBoxplot | ", groupCounts);
    console.log("drawBoxplot | ", globalCounts);

    alltime = 0
    for(var i=0, l = groupCounts.length; i < l; i++){
      alltime += groupCounts[i]['Value']
    }
    console.log("drawBoxplot | total time: ", alltime)
    drawBoxplotD3(groupCounts, globalCounts)

  })
}

function drawScatterplot(day, include_checked=true) {
  // get all user IDs

  var ref = firebase.database()
  var allIds = getAllIds()
  var my_uid = firebase.auth().currentUser.uid;
  allIds.then(function(id_list) {
    console.log("drawScatterplot | id list ", id_list);
    // Move ID to the end of the list
    shifted_id_list = id_list.slice(0);
    shifted_id_list.splice(shifted_id_list.indexOf(my_uid), 1);
    shifted_id_list.push(my_uid)
    user_promises = []
    shifted_id_list.forEach(function(id) {
      user_promises.push(getTimesFromDay(day, include_checked, id))
    })
    return Promise.all(user_promises)
  }).then(function (user_times) {
     console.log("drawScatterplot | user times ", user_times);
     data = []
     current_user_idx = user_times.length-1;
     user_times.forEach(function(times, i) {
        cname = "World";
        y = .15;
        if (i === current_user_idx) {
          cname = "Me";
          y = .15;
        }
        times.forEach(function (time) {
          data.push({'Time': timeStringToFloat(time), 'Type': cname, 'Y': y})
        })
     })
     console.log('drawScatterPlot | ', data)
     scatterplotD3(data, day)
  })
  // remove this user's ID, add that as first list of promises, get all day promises for the given day for each of those IDs
  // 
}