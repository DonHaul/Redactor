// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

//uppon instalation
/*
chrome.runtime.onInstalled.addListener(function() {



  //set some variable
  chrome.storage.sync.set({color: '#3aa757'}, function() {
    console.log('The color is green.');
  });

  //whenever we change url,  show page action?
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'developer.chrome.com'},
      })
      ],
          actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});
*/


function updateIcon(tabId,redactActive)
{

  console.log("UPDATE ICON");
  console.log(redactActive);

  if(redactActive)
  {
    chrome.browserAction.setIcon({
      path: "images/ON/Inkedget_started32_LI.jpg",
      tabId: tabId
  });

  }else if(redactActive==false)
  {
    chrome.browserAction.setIcon({
      path: "images/get_started32.png",
      tabId: tabId
  });
  }

}


  //find if redacting is active
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // read `newIconPath` from request and read `tab.id` from sender
        console.log(request)
        if(request.redacting=="true")
        {

        
      }
    }); 

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  console.log(tabId)
  console.log(changeInfo)
  console.log(tab)



  if (changeInfo.status == 'complete') {
   }
});


//"content_scripts":[{
//  "matches":["http://*/*","https://*/*"],
//  "js": ["content-script.js"]
//  }],