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

function getTimesFromDay(day, include_checked=false, uid=null) { 
  console.log("getTimesFromDay | " + day)
  var ref = firebase.database()
  if (uid === null) {
    var uid = firebase.auth().currentUser.uid;
  }
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