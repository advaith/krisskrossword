console.log("running script");
// var attached = false;

// // this will only execute code once
// doSomething = function() {
//  if (!attached) {
// 	attached = true;
//     // code
//   } else{
//   	attached = false;
//   }
// } 

// //attach your function with change event
// window.onload = function() {
//  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//   chrome.tabs.executeScript(
//       tabs[0].id,
//       {code: console.log("div.Toolbar-resetButton--1bkIx")});


//     if(window.addEventListener){
//         txtbox.addEventListener("change", doSomething, false);
//     } else if(window.attachEvent){
//         txtbox.attachEvent("onchange", doSomething);
//     }
// });
// }