

//processes string into array of rules
function processRules(rules)
{
  console.log("PRCOESSING ULES");

  let rulearr=[]

  let ruleobj={what:'',how:'',who:'',forwho:''};  
  let lines = rules.split('\n');

  //const regex = /^\s*(ignore|replace|redact|ign|red|rep)\s+(regexp|str|string|xpath)\s+(.*)\|(.*)/i;
 // const regex = /^\s*(ignore|replace|redact|ign|red|rep)\s+(regexp|str|string|xpath)\s+(.*)(?:\|(.*)|.*)/i;
//const regex = /^\s*(ignore|replace|redact|ign|red|rep)\s+(regexp|str|string|xpath)\s+(.*?)\s*-\>(.*)$/i;
const regex = /^\s*(replace|redact|red|rep)\s+(regexp|str|string|jquerysel|xpath)\s+(.+)$/i;

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



    //objects are passed by reference, so a copy must be made
    rulearr.push(Object.assign({}, ruleobj))


    
  }
  
  return rulearr;
}
