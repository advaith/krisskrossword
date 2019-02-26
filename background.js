// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

var config = {
  apiKey: "AIzaSyBtg_XwhjCpftSfjJDM-ET1Ei9iLp4-ZKM",
  databaseURL: "krisskrossword.firebaseio.com",
  storageBucket: "krisskrossword.appspot.com"
};
console.log(firebase)
firebase.initializeApp(config);
// var database = firebase.database();
// console.log(database)  
// var userId = firebase.auth().currentUser.uid;


/**
 * initApp handles setting up the Firebase context and registering
 * callbacks for the auth status.
 *
 * The core initialization is in firebase.App - this is the glue class
 * which stores configuration. We provide an app name here to allow
 * distinguishing multiple app instances.
 *
 * This method also registers a listener with firebase.auth().onAuthStateChanged.
 * This listener is called when the user is signed in or out, and that
 * is where we update the UI.
 *
 * When signed in, we also authenticate to the Firebase Realtime Database.
 */
function initApp() {
  // Listen for auth state changes.
  firebase.auth().onAuthStateChanged(function(user) {
    console.log('User state change detected from the Background script of the Chrome Extension:', user);
  });
}

window.onload = function() {
  initApp();
};  

chrome.runtime.onInstalled.addListener(function() {
  // chrome.storage.sync.set({color: '#3aa757'}, function() {
  //   // console.log("The color is green.");
  // });
 chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {urlContains: 'nytimes.com/crosswords'},
        })
        ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });
  });



// Database read functions
function getUsersTime(userIds, day, date){
  // Function to aggregate stats from list of friends (stored in userIds)
}

function getUserTime(userId, day, date) {
  // Function to get specific day's time for a given user
  var ref = firebase.database().ref(userId + '/' + day + '/' + date);
  ref.on("value", function(snapshot) {
     console.log(snapshot.val()['time']);
  }, function (error) {
     console.log("Error: " + error.code);
  });
}

function getUserDayStats(userId, day) {
  var ref = firebase.database().ref(userId + '/' + day);
  ref.on("value", function(snapshot) {
    console.log(snapshot.val());
    // Iterate over all elements in snapshot.val()
    // Compute average/improvement
    // Construct popup histogram
  }, function (error) {
     console.log("Error: " + error.code);
  });
}




