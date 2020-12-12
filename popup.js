//fetch update inorder to call function there
//alternative wouuld be to send message that then would execute funcitonlike so: chrome.runtime.sendMessage({ msg: "startFunc" });
//and do this in bg.js
//https://stackoverflow.com/questions/5443202/call-a-function-in-background-from-popup



/* 
//INSERT THIS TO SIMULATE  FIRST TIME USER IS LOGGING AND THERE IS NO LOCAL STORAGE
          chrome.storage.local.clear(function() {
            var error = chrome.runtime.lastError;
            if (error) {
                console.error(error);
            }
        });
*/

//sideloaded via popup.html
//import App from "./entrymanager.js"
//import * as processRules from "./processRules.js"

//open connection to background script
 var bgPage = chrome.extension.getBackgroundPage();


//holds all needed info, in each popup
var data={mode:'block',
          redacting:false,
          rules:[],
          imgredact:false}



//whenever the popup is open, it queries fetch information from the current tab to see if redacting is on
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

  console.log("CUR TAB IS");
  console.log(tabs[0].id)
  //receives back redacting variable
  chrome.tabs.sendMessage(tabs[0].id, {action: "getRedacting"}, function(redacting) {

    console.log(redacting)

    if(redacting=="true")
    {
      data.redacting=true;
      $("#Toggle").text("Turn OFF");
    }
});
});

//fetch all storage rules and set them up on the popup
chrome.storage.local.get(['rules','imgredact','mode'], function(result) {


    //default
    if(result.rules==undefined)
    {
      $("#rules").val("redact regexp .*")
    }
    else
    {
      $("#rules").val(result.rules);
    }
    //data.rules = result.rules;

    //update value of text area
    if(result.mode==undefined)
    {
      //default
      $('#mode').val("block").change();
    }else
    {
      $('#mode').val(result.mode).change();
    }
  

    //update image redact
    if(result.imgredact==true)
    {
      $("#imgredact").val("yes").change();

    }else
    {
      //default
      //.CHANGE IS USED TO TRIGGER date.image update
      $("#imgredact").val("no").change();
    }
});  


//what happends when changes are made to the rules text area
//.bind('change keyup',
$('#rules').change(function(){

  let rules = $("#rules").val();
  console.log(rules);
  chrome.storage.local.set({rules}, function() {
    console.log('Rules Updated');
  });  
});



//https://stackoverflow.com/questions/5745822/open-a-help-page-after-chrome-extension-is-installed-first-time
$("#help").click(function(){
  chrome.tabs.create({url: "options.html"});  
});

//toggle image redacting on or off
$("#imgredact").change(function(){

  if( $(this).children("option:selected").val()=='yes')
  {

    data.imgredact = true;
  }
  else
  {
    data.imgredact = false;
  }
  chrome.storage.local.set({imgredact:data.imgredact }, function() {
    console.log('ImgRedact Update');
  });  

  
});


//templates for rules
$("#ruleTemplates").change(function(){

  let templie = $(this).children("option:selected").val()
  if( templie == 'redactall')
  {

    $("#rules").val("redact regexp .*").change();

  }else if (templie == 'redactnumbers')
  {
    $("#rules").val("redact regexp [0-9]").change();

  }else if (templie=='replacename')
  {
    $("#rules").val("replace string John->Casey").change();
  }
  else if (templie=='redactjq')
  {
    $("#rules").val("redact jquerysel #paragraph").change();
  }  
  
});


//should redactions be replaced by blocks or letters?
$("#mode").change(function(){

  data.mode = $(this).children("option:selected").val();

  chrome.storage.local.set({mode:data.mode }, function() {
    console.log('Mode Update');
  });  
});


//toggle redaction in this page
$("#Toggle").click(function() {
//toggle_btn.onclick = function(element) {

  //flip the switch
  data.redacting=!data.redacting;

  console.log(data);

  if(data.redacting==true)
  {
    $("#Toggle").text("Turn OFF");

      //retrieve rules and process them
      data.rules = processRules($('#rules').val())



    getTabID().then((tabid)=>{
      let msg ={
        action:"redact",
        data:data
      }  

      console.log("REDACT ON");
      chrome.tabs.sendMessage(tabid,msg);

      bgPage.updateIcon(tabid,true);

    });

  }else
  {


    getTabID().then((tabid)=>{
      let msg ={
        action:"stopredact",
        data:data
      }  

      console.log("REDACT OFF");
      chrome.tabs.sendMessage(tabid,msg);

      bgPage.updateIcon(tabid,false);

    });

    $("#Toggle").text("Turn ON");
    
  }
});


//tab promise wrapper
//https://stackoverflow.com/questions/62235131/how-to-wait-for-the-chrome-tabs-query-to-return-tab-id
function getTabID() {
  return new Promise((resolve, reject) => {
      try {
          chrome.tabs.query({
              active: true, currentWindow: true
          }, function (tabs) {
              resolve(tabs[0].id);
          })
      } catch (e) {
          reject(e);
      }
  })
}

//what happens when the onn button is presed
$("#ON").click ( function() {

    console.log(processRules);
    //retrieve rules and process them
    data.rules = processRules($('#rules').val());

    console.log(data);

  console.log("PROMISA");
  getTabID().then((tabid)=>{
    let msg ={
      action:"redactonce",
      data:data
    }  

    console.log("REDACT ON");
    console.log(tabid,msg);
    chrome.tabs.sendMessage(tabid,msg);

  });  
});
