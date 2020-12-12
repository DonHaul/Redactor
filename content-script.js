//it is side loaded via the manifest    
//require * as redactorlogic from "./processRules.js"

var nextID = 1;

//adds property to  thing
function hashElem(div){
   div.hashID = div.hashID || ('hashID_' + (nextID++));
   return div.hashID;
}

/*keeps track of what elements were already changed.
this is done in case element are reloaded for some reason
*/
mutatedElems = {}

// Stop the observer, when it is not required any more.
//


// Get saved data from sessionStorage
let redacting = sessionStorage.getItem('redacting');


// Create an observer instance.
var observer;


function createMutObserver(data)
{
return new MutationObserver(function (mutations) {


    //console.log("Mutation Triggered");

    //hide images
    mutations.forEach(function (mutation) {
     // console.log(mutation);

      //console.log(mutation.type);
      //console.log(mutation.attributeName);
      //console.log(mutation.target.nodeName)
      //console.log(mutation.target.nodeName)


      if(mutation.type=='childList')
      {
        //console.log(mutation);
        //console.log()
        var nodet;
        for( nodet of mutation.addedNodes)
        {
            redactPage(nodet,data.mode,data.rules,data) 
        }
      
       //redactPage(document.getElementsByTagName('*'),result.mode,processRules(result.rules),result);
    }else if(data.imgredact==true &&  mutation.type=="attributes" && mutation.attributeName=="src" && mutation.target.nodeName=="IMG")
      { 
          //console.log(mutation.target.outerHTML);
        //if does not exist in mutations elems
        //alternative to issmaenode https://www.w3schools.com/JSREF/met_node_issamenode.asp#:~:text=The%20isSameNode()%20method%20checks,the%20same%20node%2C%20otherwise%20false.
        if(hashElem(mutation.target) in mutatedElems == false)
        {

        
          //hide img
         // console.log("TIME TO HIDE");
          RedactImg(mutation.target);
          hashElem(mutation.target)
          mutatedElems[hashElem(mutation.target)]=mutation.target;
        }
        else{
           // console.log("Already Exists");
        }
      }

    });
  });
}

  var config = {
    attributes: true,
    attributeFilter: [ "src" ],
    childList: true, 
    subtree: true
  };
  

  let imgredact=false;


if(redacting=="true")
{
    //console.log("REDACTING ACTIVE");

    chrome.storage.local.get(['rules','imgredact','mode'], function(result) {

        //console.log(result);

        
        
        imgredact=result.imgredact;

        
        observer = createMutObserver(result);
        redactPage(document.documentElement,result.mode,processRules(result.rules),result);
      });     
}


    // send message to background script to update icon if thats the case
    //console.log("SEND MESSAGE");
chrome.runtime.sendMessage({ action:"updateIcon",redacting: redacting });



function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }


 function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

function redactStr(str,mode)
{
    //console.log(str)
    let outputstr;
    let copiestr=str;
    //escapes spaces
    let matchies = copiestr.matchAll(/\S+/gi);

    let auxtstr='';

    for (let match of matchies) 
    {
        //console.log(match)
        if(mode=="random")
        {
            auxtstr = makeid(match[0].length);
        }else if(mode=="block")
        {
            auxtstr = "■".repeat(match[0].length);//█ █▆▀▀▀▀	▊▊▊▊▊▊▊ ■■■■ ◼◼◼
        }
                
        copiestr = copiestr.slice(0, match.index) +auxtstr + copiestr.slice(match.index+match[0].length);

         }
               
            

    return copiestr;
}

function redactPage(nodestoredact,redactType,rules,data,rec )
 {
     //console.log("REDACTUM PATRONUM");

    //turn off while modifying
    if(observer!=undefined)
{
    observer.disconnect();
}

    //console.log(data.imgredact);

    //replace images
    if(data.imgredact==true)
    {


        let imgs = document.getElementsByTagName('img');
        //console.log("IMAGES FOUND")
        //console.log(imgs);
        for (elt of imgs)
        {

            elt.src=`https://via.placeholder.com/${elt.width}x${elt.height}`;
            

        }

        //replace svgssss
        let svgs = document.getElementsByTagName('svg')
        //console.log(svgs);

        for (elt of svgs)
        {
            //console.log(elt);


            var btn = document.createElement("img");   // Create a <button> element
            btn.src = "https://via.placeholder.com/36x36"; 
            btn.style= `height:${elt.height};width:${elt.width}`               // Insert text
            //elt.outerHTML=`<img src="https://via.placeholder.com/36x36" style="height:${elt.height};width:${elt.width}" >`
            elt.replaceWith(btn);
            elt.remove();

        }

        let iframes =  document.getElementsByTagName('iframe');
        for (elt of iframes)
        {
            //console.log(elt);


            var btn = document.createElement("img");   // Create a <button> element
            btn.src = "https://via.placeholder.com/36x36"; 
            btn.style= `height:${elt.height};width:${elt.width}`               // Insert text
            //elt.outerHTML=`<img src="https://via.placeholder.com/36x36" style="height:${elt.height};width:${elt.width}" >`
            elt.replaceWith(btn);
            //elt.remove();

        }
        /*
        let vids= document.getElementsByTagName('video')
        
        var i;
        console.log(vids.length);
            for (i = 0; i < vids.length; i++) {
            
               
    
    
                console.log(btn);
                
                vids[i].pause();
                vids[i].removeAttribute('src'); // empty source
                vids[i].load();
                vids[i].abcdefgh='abcdefgh';
            }*/

    }
        

//traverse tree
    var elt, ni;

    ni = document.createNodeIterator(nodestoredact, NodeFilter.SHOW_ELEMENT);





//replace text


//for every elemnt
//for (elt of paragraphs)
while(elt = ni.nextNode()) {
    //console.log(elt.nodeName);
//{

    if(elt.tagName=="IFRAME")
    {
        console.log("IFRAMMME")
        console.log(elt);
    }

    //skipp style and script
    if (elt.tagName=="STYLE" || elt.tagName=="SCRIPT")
    {
        continue;
    }


   /* console.log(elt.tagName)
    if(elt.tagName=='HEAD')
        break;*/
    //loop thorugh its childs
    for ( var i = 0; i < elt.childNodes.length; i++ ) {

        
        
        //look for childs tha are text
        if(elt.childNodes[i].nodeName == "#text")
        {
            //APPLY LOCAL RULES: STRING AND REGEXP RULES HERE
            let text2change = elt.childNodes[i].nodeValue;
    
           /*     console.log('len');
                console.log(text2change,text2change.length);*/
            //for each rule
            let mode = 'normal';

            let outputstr=text2change;
            let matches=[]

            //replace all by default

            //if all tehre is is spacing, then skip
            let matchspacesonly = text2change.match(/^\s*$/g);
            if(matchspacesonly!=null)
            {
                //if found only spaces skipp
                continue;
            }

 

            //apply rules in the order they come
            for (const rule of rules)
            {
                //this specific rules is treated before
                /*if (rule.what=='ignore' && rule.how=='regexp' && rule.who=='.*')
                {
                    continue;
                }*/

                //if its a global rule, then skip
                if(rule.how=='jquerysel')
                {
                    continue;
                }

                //console.log("RULE");
                mode=rule.what;

                if(rule.how=='string')
                {
                    matches = text2change.matchAll(rule.who);

                }
                else if(rule.how=='regexp')
                {
                    matches = text2change.matchAll(new RegExp(rule.who,'gsi'));
                
                }

             //IF THERE WERE IN FACT ANY MATCHES
            for (const match of matches) {
                    
                //Empty spaces are not to be matched. javascript matches them for some reason
                if(match[0].length==0)
                {
                    continue;
                }

                //console.log(rule.what);
                //if it was an ignore rule
                 if(rule.what=='redact')
                {



                    outputstr = outputstr.slice(0, match.index) + redactStr(match[0] ,redactType); + outputstr.slice(match.index+match[0].length);
                }
                else if(rule.what=='replace')
                {
                    outputstr = outputstr.slice(0, match.index) + rule.forwho + outputstr.slice(match.index+match[0].length);
                }
            }
        
            }



        elt.childNodes[i].nodeValue=outputstr;            
     }
     
     


    }


         //if element has backgorund image replace it
         if(data.imgredact==true)
         {
             
         //fetch style
         style = elt.currentStyle || window.getComputedStyle(elt, false);
    
         //fetch bckgoidn img link
         bi = style.backgroundImage.slice(4, -1).replace(/"/g, "");
    
         if(bi.length>2)
         {
            elt.style.backgroundImage="url(\"https://via.placeholder.com/350x150\")";
         }
    
    
        }
}


//apply global rules
//apply rules in the order they come
for (const rule of rules)
{
    //this specific rules is treated before
    /*if (rule.what=='ignore' && rule.how=='regexp' && rule.who=='.*')
    {
        continue;
    }*/
    let foundelems = [];

    //oonly apply global rules
    if(rule.how=='jquerysel')
    {
      //xpath

    foundelems = document.querySelectorAll(rule.who)
    }
    else if(rule.how=='xpath')
    {
        

        //ether like so
        //foundelems = document.evaluate(rule.what, document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
        //foundelems.iterateNext()

        //or like so

        let xpathresults = document.evaluate(rule.who, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

        for (var i =0;i<xpathresults.snapshotLength;i++)
        {

            console.log("SAMAZING");
            console.log(xpathresults.snapshotItem(i))
            foundelems.push(xpathresults.snapshotItem(i));
        }

    }
    else
    {
        continue;
    }


        //css selector
        console.log(foundelems);

            for (elt of foundelems)
        {
            


        /* console.log(elt.tagName)
            if(elt.tagName=='HEAD')
                break;*/
            //loop thorugh its childs
            for ( var i = 0; i < elt.childNodes.length; i++ ) {

                if(elt.childNodes[i].nodeName != "#text")
                    continue;


            if(rule.what=='redact')
            {
                elt.childNodes[i].nodeValue=redactStr(elt.childNodes[i].nodeValue ,redactType);  

            }else if (rule.what=='replace')
            {
                console.log("YES");
                elt.childNodes[i].nodeValue=rule.forwho;  
            }
            
            }
        }
    }


          // Observe the body (and its descendants) for `childList` changes.
  //https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe
if(observer!== undefined)
{
  observer.observe(document.body, config);

}
 }

 function RedactImg(img)
 {
    img.src=`https://via.placeholder.com/${img.width}x${img.height}`;
 }



//MESSAGE HANGLER
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {

        console.log("MESSAGE RECEIVED");
        console.log(message);
        //https://stackoverflow.com/questions/31111721/pass-a-variable-from-content-script-to-popup/31112456

        switch(message.action) {
            
            case "getRedacting":
                //sends message back to source with variable
                sendResponse(redacting);
                break;
            case "redactonce":
                //redacts one single time
                console.log(message);
                redactPage(document.documentElement,message.data.mode,message.data.rules,message.data);
                break;
            case "redact":
                //redacts ON
                sessionStorage.setItem('redacting', "true");
                //message.redactType
                observer = createMutObserver(message.data);

                redacting="true";
                redactPage(document.documentElement,message.data.mode,message.data.rules,message.data);
                break;
                case "stopredact":
                    //REDACT OFF
                    sessionStorage.setItem('redacting', "false");
                    redacting="false";
                    break;
            default:
                console.error("Unrecognised message: ", message);
        }
    }
);





