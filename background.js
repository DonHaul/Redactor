

function updateIcon(tabId,redactActive)
{

  console.log("UPDATE ICON");
  console.log(redactActive);

  if(redactActive)
  {
    chrome.browserAction.setIcon({
      path: "images/icon128ON.png",
      tabId: tabId
  });

  }else if(redactActive==false)
  {
    chrome.browserAction.setIcon({
      path: "images/icon128.png",
      tabId: tabId
  });
  }

}


  //find if redacting is active
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // read `newIconPath` from request and read `tab.id` from sender
        console.log(request)

        if(request.action=='updateIcon')
        {

          if(request.redacting=="true")
          {
            chrome.browserAction.setIcon({
              path: "images/icon128ON.png",
              tabId: sender.tab.id
          });
        
          }else
          {
            chrome.browserAction.setIcon({
              path: "images/icon128.png",
              tabId: sender.tab.id
          });
          }
          


        }
        
        
      }
    ); 

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