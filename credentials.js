// TODO(DEVELOPER): Change the values below using values from the initialization snippet: Firebase Console > Overview > Add Firebase to your web app.
// Initialize Firebase
var config = {
  apiKey: "AIzaSyBtg_XwhjCpftSfjJDM-ET1Ei9iLp4-ZKM",
  databaseURL: "krisskrossword.firebaseio.com",
  storageBucket: "krisskrossword.appspot.com"
};
firebase.initializeApp(config);

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

var looping_interval;
function initApp() {
  // Listen for auth state changes.
  // [START authstatelistener]
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var uid = user.uid;
      var providerData = user.providerData;

      firebase.database().ref('/users/' + user.uid).set({
        name: displayName,
        email: email,
        photoURL: photoURL,
        emailVerified: emailVerified
      });

      // [START_EXCLUDE]
      document.getElementById('quickstart-button').textContent = 'Sign out';
      drawHistogram(true);
      drawBoxplot(true);
      drawScatterplot("Wednesday", include_checked=true);
      drawScatterplot("Tuesday", include_checked=true);
      drawScatterplot("Monday", include_checked=true);
      writeDates();
      writeDayAverages();
      eval_page();

      // document.getElementById('quickstart-account-details').textContent = JSON.stringify(user, null, '  ');
      // [END_EXCLUDE]

      // get all the initialized firebase nodes under a user

    } else {
      // Let's try to get a Google auth token programmatically.
      // [START_EXCLUDE]
      document.getElementById('quickstart-button').textContent = 'Sign In';
      // document.getElementById('quickstart-account-details').textContent = 'null';
      // [END_EXCLUDE]
    }
    document.getElementById('quickstart-button').disabled = false;
  });
  // [END authstatelistener]

  document.getElementById('quickstart-button').addEventListener('click', startSignIn, false);
}

/**
 * Start the auth flow and authorizes to Firebase.
 * @param{boolean} interactive True if the OAuth flow should request with an interactive mode.
 */
function startAuth(interactive) {
  // Request an OAuth token from the Chrome Identity API.
  chrome.identity.getAuthToken({interactive: !!interactive}, function(token) {
    if (chrome.runtime.lastError && !interactive) {
      console.log('It was not possible to get a token programmatically.');
    } else if(chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else if (token) {
      // Authorize Firebase with the OAuth Access Token.
      var credential = firebase.auth.GoogleAuthProvider.credential(null, token);
      firebase.auth().signInAndRetrieveDataWithCredential(credential).catch(function(error) {
        // The OAuth token might have been invalidated. Lets' remove it from cache.
        if (error.code === 'auth/invalid-credential') {
          chrome.identity.removeCachedAuthToken({token: token}, function() {
            startAuth(interactive);
          });
        }
      });
    } else {
      console.error('The OAuth Token was null');
    }
  });
}

function removeGraphs() {
  svgs = document.getElementsByTagName("svg"); 
  while(svgs.length > 0) {
    svgs[0].remove()
  }
}

/**
 * Starts the sign-in process.
 */
function startSignIn() {
  document.getElementById('quickstart-button').disabled = true;
  if (firebase.auth().currentUser) {
    firebase.auth().signOut();
    removeGraphs()
  } else {
    startAuth(true);
  }
}

window.onload = function() {
  initApp();
};

function eval_page() {
  var uid = firebase.auth().currentUser.uid;
  var day_dict = {0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3:'Wednesday', 4:'Thursday', 5:'Friday', 6:'Saturday'}
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    var url = tabs[0].url;
    console.log(url.includes("game"))
    var url_els = url.split('/')
    n_url_els = url_els.length
    if (url.includes('game')) {
      var date_els = url_els.slice(n_url_els-3, n_url_els)
      var date = date_els.join("");
    } else {
      console.log("eval_page | URL does NOT include game");
      var d = new Date();
      var date = yyyymmdd(d);
      var date_els = date.split("/");
      date = date.split("/").join("");
    }
    
    obj = {}
    obj[date] = 'undefined'
    console.log("eval_page | query: ", obj);
    chrome.storage.local.get(obj, function(data) {
      if (data[date] === 'undefined') {
        if (url.includes('game')) {
          console.log("eval_page | undefined; going to do continuous polling : ", data);
          document.getElementById('my-score-details').textContent = "Today's Time: " + "??" 
          looping_interval = setInterval(loop_de_loop, 3 * 1000)
        }
      } else {
        console.log("eval_page | worked! : ", data);
        document.getElementById('my-score-details').textContent = "Today's Time: " + data[date] 

        console.log("eval page| d ",date_els[0], date_els[1], date_els[2])
        d = new Date(date_els[0], parseInt(date_els[1]-1), date_els[2]);
        console.log("eval page| d ", d);

        day = day_dict[d.getDay()]
        console.log("eval page | calling getFriendsData and getAllData")
        getFriendsData(uid, day, date)
        getAllData(uid, day, date)
      }
      
    })
  });
}

function loop_de_loop() {
  console.log("loop_de_loop | starting");
  const scriptToExec = `(${scrapeThePage})()`;
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
     chrome.tabs.executeScript(
        tabs[0].id,
        {code: scriptToExec}, 
        function(results) {
          console.log("loop_de_loop | result ", results)
          if (results[0] == 1) {
            console.log("loop_de_loop | clearing the interval!")
            clearInterval(looping_interval);
          }
        });
  });
}

