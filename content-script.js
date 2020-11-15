console.log('content-scriptjs');

const generateRandomString = (length=6)=>Math.random().toString(20).substr(2, length);

/*et paragraphs = document.querySelectorAll('p,li,h1,h2,h3,h4,h5,h6,span,a')*/
/*let imgs = document.getElementsByTagName('img')*/


// Get saved data from sessionStorage
let redacting = sessionStorage.getItem('redacting');


console.log(redacting)


if(redacting=="true")
{
    console.log("redact now");
    redactPage();
}


    // send message to background script
    console.log("SEND MESSAGE");
chrome.runtime.sendMessage({ "redacting" : redacting });



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
    console.log(str)
    let outputstr;
    let copiestr=str;
    //escapes spaces
    let matchies = copiestr.matchAll(/\S+/gi);

    let auxtstr='';

    for (let match of matchies) 
    {
        console.log(match)
        if(mode=="random")
        {
            auxtstr = makeid(match[0].length);
        }else if(mode=="block")
        {
            auxtstr = "▅".repeat(match[0].length);
        }
        
        
        copiestr = copiestr.slice(0, match.index) +auxtstr + copiestr.slice(match.index+match[0].length);

 
        }
               
            

    return copiestr;
}

 function redactPage(redactType,rules)
 {

    console.log(rules);
//replace text
let paragraphs = document.getElementsByTagName('*');

//for every elemnt
for (elt of paragraphs)
{
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

            let outputstr='test';
            let matches=[]

            //replace all by default

            //if all tehre is is spacing, then skip
            let matchspacesonly = text2change.match(/^\s*$/g);
            if(matchspacesonly!=null)
            {
                //if found only spaces skipp
                continue;
            }


            outputstr = redactStr(text2change,redactType);



            //apply rules in the order they come
            for (const rule of rules)
            {
                console.log("RULE");
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
                if(rule.what=='ignore')
                {
                   // console.log("MATCHFOUND:"+match[0]+"|");
                   /* console.log('MATC');
                    console.log(match[0]);
                    console.log(match[0].length);*/
                                        //REDACT THE CHOSEN STRING
                               /*         console.log(0, match.index,match[0].length)
                                        console.log("B4:",outputstr.slice(0, match.index),"|");
                                        console.log("AFTER:",outputstr.slice(match.index+match[0].length),"|");*/
                outputstr = outputstr.slice(0, match.index) +match[0] + outputstr.slice(match.index+match[0].length);

 
                }
                else if(rule.what=='redact')
                {



                    outputstr = outputstr.slice(0, match.index) + redactStr(match[0] ,redactType); + outputstr.slice(match.index+match[0].length);
                }
            }
        
            }



        elt.childNodes[i].nodeValue=outputstr;            
     }
     
     

     //if element has backgorund image replace it

     //fetch style
     style = elt.currentStyle || window.getComputedStyle(elt, false);
     //fetch bckgoidn img link
     bi = style.backgroundImage.slice(4, -1).replace(/"/g, "");

     if(bi.length>2)
     {
        elt.style.backgroundImage="url(\"https://via.placeholder.com/350x150\")";
     }



}
 

//replace images
let imgs = document.getElementsByTagName('img');

for (elt of imgs)
{
    elt.src=`https://via.placeholder.com/${elt.width}x${elt.height}`;
    

}

let svgs = document.getElementsByTagName('svg');


for (elt of svgs)
{
        
    elt.outerHTML=`<img src="https://via.placeholder.com/36x36" style="height:${elt.height};width:${elt.width}" >`

}
}
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
                redactPage(message.data.mode,message.data.rules);
                break;
            case "redact":
                //redacts ON
                sessionStorage.setItem('redacting', "true");
                //message.redactType
                redactPage(message.data.mode,message.data.rules);
                break;
                case "stopredact":
                    //REDACT OFF
                    sessionStorage.setItem('redacting', "false");
                    break;
            default:
                console.error("Unrecognised message: ", message);
        }
    }
);






