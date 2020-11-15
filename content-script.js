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

 function redactPage(redactType,redactRules)
 {

    console.log(redactType);
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

    //loop thorugh its childs
    for ( var i = 0; i < elt.childNodes.length; i++ ) {

        //look for childs tha tare text
        if(elt.childNodes[i].nodeName == "#text")
        {
            //APPLY LOCAL RULES: STRING AND REGEXP RULES HERE
            let text2chamge = elt.childNodes[i].nodeValue;

            


            
       matches = text2chamge.match(/[A-Z]+/gi);

        if (matches == null)
        {
            continue;
        }
        let auxstr = text2chamge;

        //for each word
        for (m of matches)
        {
            //for each rule
            let mode = 'normal'

            for (const rule of rules)
            {

                if(rule.how=='string' && m==rule.who)
                {
                    mode=rule.what;
                }
                else if(rule.how=='regexp')
                {
                
                }

                const regex = /^\s*(ignore|replace|redact|ign|red|rep)\s+(regexp|str|string|xpath)\s+(.*)/i;
            
            //replace 1 by 1 each word
            if(redactType=="random")
            {
            auxstr = auxstr.replace(m, makeid(m.length));
        }else if(redactType=="block")
        {
            auxstr = auxstr.replace(m, "▅".repeat(m.length));
        }
            //console.log(m)
            //console.log
        }

        elt.childNodes[i].nodeValue=auxstr;
       // console.log(elt.childNodes[i].nodeValue);
        //console.log("==================");
        }        
     }
     
     
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






