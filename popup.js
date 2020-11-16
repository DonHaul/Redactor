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

 var bgPage = chrome.extension.getBackgroundPage();


//holds all needed info 
var data={mode:'random',
          redacting:false,
          rules:[],
          imgredact:false}



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

//fetch all storeage rules
chrome.storage.local.get(['rules','imgredact','mode'], function(result) {
  console.log('rukes');
  console.log(result);

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
    $('#mode').val("block");
  }else
  {
    $('#mode').val(result.mode);
  }
  

  //update image redact
  if(result.imgredact==true)
  {
    $("#imgredact").val("yes");

  }else
  {
    //default
    $("#imgredact").val("no");
  }



  



});  

//.bind('change keyup',
$('#rules').change(function(){

  let rules = $("#rules").val();
  console.log(rules);
  chrome.storage.local.set({rules}, function() {
    console.log('Rules Updated');
  });  
});


/*
//update rules
$( "#save" ).click(function() {

  let rules = $("#rules").val();
  console.log(rules);
});
*/

//https://stackoverflow.com/questions/5745822/open-a-help-page-after-chrome-extension-is-installed-first-time
$("#help").click(function(){

  chrome.tabs.create({url: "options.html"});

  
});


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



$("#mode").change(function(){

  data.mode = $(this).children("option:selected").val();

  chrome.storage.local.set({mode:data.mode }, function() {
    console.log('Mode Update');
  });  
});




function processRules(rules)
{
  console.log("PRCOESSING ULES");

  rulearr=[]

  let ruleobj={what:'',how:'',who:'',forwho:''};  
  let lines = rules.split('\n');

  //const regex = /^\s*(ignore|replace|redact|ign|red|rep)\s+(regexp|str|string|xpath)\s+(.*)\|(.*)/i;
 // const regex = /^\s*(ignore|replace|redact|ign|red|rep)\s+(regexp|str|string|xpath)\s+(.*)(?:\|(.*)|.*)/i;
//const regex = /^\s*(ignore|replace|redact|ign|red|rep)\s+(regexp|str|string|xpath)\s+(.*?)\s*-\>(.*)$/i;
const regex = /^\s*(replace|redact|red|rep)\s+(regexp|str|string|jquerysel)\s+(.+)$/i;

  for(var i = 0;i < lines.length;i++){
    
    //code here using lines[i] which will give you each line

    console.log(lines[i]);
    let found = lines[i].match(regex);
    console.log(found);
    if(found==null)
      continue;
    
    ruleobj.what=found[1].toLowerCase();
    ruleobj.how=found[2].toLowerCase();
    ruleobj.who=found[3];
    ruleobj.forwho=found[4];

    if(ruleobj.what=="ign")
    {
      ruleobj.what="ignore"
    }else if(ruleobj.what=="rep")
    {
      ruleobj.what="replace"
    }else if(ruleobj.what=="red")
    {
      console.log("HERE");
      ruleobj.what="redact"
    }else  if(ruleobj.how=="str")
    {
      ruleobj.how="string"
    }


    if (found[1]=='replace')
    {

    lol = found[3].match(/(.+?)->(.*)/i)
    
    //overwirte previous who
    ruleobj.who=lol[1];
    ruleobj.forwho=lol[2];
    }
   /* else
    {
    console.log("NORMAL:",match[3]);
    }*/




    console.log(found[1].toLowerCase());
    console.log(ruleobj.what,ruleobj.how,ruleobj.who)
    console.log("OBS");
    console.log(ruleobj);


    //objects are passed by reference, so a copy must be made
    rulearr.push(Object.assign({}, ruleobj))


    
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


  console.log("REDACTY BOI RULY");

    //retrieve rules and process them
    data.rules = processRules($('#rules').val());

    console.log(data);

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