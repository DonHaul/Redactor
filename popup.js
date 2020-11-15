//fetch update inorder to call function there
//alternative wouuld be to send message that then would execute funcitonlike so: chrome.runtime.sendMessage({ msg: "startFunc" });
//and do this in bg.js
//https://stackoverflow.com/questions/5443202/call-a-function-in-background-from-popup
/*
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse){
        if(request.msg == "startFunc") func();
    }
);
*/
 var bgPage = chrome.extension.getBackgroundPage();


//holds all needed info 
var data={mode:'random',
          redacting:false,
          rules:[]}


//whenever the popup is open, it queries fetch information from the current tab
   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "getRedacting"}, function(redacting) {
        /* ... */
        console.log(redacting)

        if(redacting=="true")
        {
          data.redacting=true;
          $("#Toggle").text("Turn OFF");
        }
    });
});

//fetch righting rules
chrome.storage.local.get('rules', function(result) {
  console.log('rukes');
  console.log(result);

  //data.rules = result.rules;

  //update value of text area
  $("#rules").val(result.rules);
});  

//update rules
$( "#save" ).click(function() {

  let rules = $("#rules").val();
  console.log(rules);


  //update popup rules


  //update stirage rulles
  //rules is shortcut for rules:rules
  chrome.storage.local.set({rules}, function() {
    console.log('Rules Updated');
  });  


  //retrieve rules and process them
  data.rules = processRules($('#rules').val())
});


$("#mode").change(function(){

  data.mode = $(this).children("option:selected").val();

  
});


function processRules(rules)
{

  rulearr=[]

  
  var lines = rules.split('\n');

  const regex = /^\s*(ignore|replace|redact|ign|red|rep)\s+(regexp|str|string|xpath)\s+(.*)/i;

  for(var i = 0;i < lines.length;i++){
    ruleobj={what:'',how:'',who:''};
    //code here using lines[i] which will give you each line

    let found = lines[i].match(regex);
    
    ruleobj.what=found[1].toLowerCase();
    ruleobj.how=found[2].toLowerCase();
    ruleobj.who=found[3];

    if(ruleobj.what="ign")
    {
      ruleobj.what="ignore"
    }
    if(ruleobj.what="rep")
    {
      ruleobj.what="replace"
    }
    if(ruleobj.what="red")
    {
      ruleobj.what="redact"
    }
    if(ruleobj.how="str")
    {
      ruleobj.how="string"
    }

    rulearr.push(ruleobj)


    
  }
  
  return rulearr;
console.log(rulearr);
}

$("#Toggle").click(function() {
//toggle_btn.onclick = function(element) {

  //flip the switch
  data.redacting=!data.redacting;

  console.log(data);

  if(data.redacting==true)
  {
    $("#Toggle").text("Turn OFF");



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
              active: true,
          }, function (tabs) {
              resolve(tabs[0].id);
          })
      } catch (e) {
          reject(e);
      }
  })
}


$("#ON").click ( function(element) {




  //chrome.tabs.query(params,gotab);
  console.log("PROMISA");
  getTabID().then((tabid)=>{
    let msg ={
      action:"redactonce",
      data:data
    }  

    console.log("REDACT ON");
    chrome.tabs.sendMessage(tabid,msg);

  });
  console.log("PROMISU");
  
});


function gotab(tabs){

  let msg ={
    action:"redact"
  }

  chrome.tabs.sendMessage(tabs[0].id,msg);
};