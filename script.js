const KEY="study-bunny-v1";
const $=id=>document.getElementById(id);
let data;
try{data=JSON.parse(localStorage.getItem(KEY))||{sessions:0,carrots:0,minutes:0}}catch{data={sessions:0,carrots:0,minutes:0}}
let focus=true,running=false,remaining=1500,endAt=0,tickId=null;
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function render(){
 const tier=Math.floor(data.sessions/3);
 $("sessions").textContent=data.sessions;$("carrots").textContent=data.carrots;$("minutes").textContent=data.minutes;
 $("growth").style.width=(data.sessions%3)/3*100+"%";
 $("growthLabel").textContent=(data.sessions%3)+" / 3 sessions until next growth";
 $("stage").textContent=["Baby Bunny","Growing Bunny","Super Bunny","Royal Bunny"][Math.min(tier,3)];
 $("bunny").style.scale=1+Math.min(tier,3)*.09;
 $("clock").textContent=String(Math.floor(remaining/60)).padStart(2,"0")+":"+String(remaining%60).padStart(2,"0");
 $("start").textContent=running?"Ⅱ Pause timer":focus?"♡ Start focusing":"🍬 You deserve a treat!";
 $("mode").textContent=focus?"STUDY":"BREAK";
 $("phaseLabel").textContent=focus?"📖 25 minutes of focus, then a treat ♡":"🍓 You deserve a treat! Enjoy your 5-minute break ♡";
}
function stop(){running=false;clearInterval(tickId);tickId=null}
function startTimer(){running=true;endAt=Date.now()+remaining*1000;tickId=setInterval(tick,250);render()}
function finish(){
 stop();
 if(focus){data.sessions++;data.carrots+=2;data.minutes+=25;save();$("message").textContent="You deserve a treat! +2 carrots 🥕💗";focus=false;remaining=300}
 else{$("message").textContent="All refreshed! Your bunny is cheering you on 🌸";focus=true;remaining=1500}
 startTimer();
}
function tick(){remaining=Math.max(0,Math.ceil((endAt-Date.now())/1000));if(remaining===0)finish();else render()}
$("start").onclick=()=>{if(running){tick();if(running)stop()}else startTimer();render()};
$("reset").onclick=()=>{stop();focus=true;remaining=1500;render()};
render();


const buddyResponse=$("buddyResponse");
const AI_ENDPOINT=""; // After deploying worker, paste its HTTPS URL ending in /chat here.
let history=[];
let busy=false;
async function askBuddy(message){
 if(busy)return;
 if(!AI_ENDPOINT){
  buddyResponse.textContent="🐰 My AI brain needs connecting! Deploy the Cloudflare Worker and set AI_ENDPOINT in script.js. See README for setup.";
  return;
 }
 busy=true;
 const button=$("buddyForm").querySelector('button[type="submit"]');
 button.disabled=true;
 buddyResponse.textContent="🐰 Bunny Buddy is thinking... ♡";
 try{
  const response=await fetch(AI_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message,history})});
  const result=await response.json();
  if(!response.ok)throw new Error(result.error||"Couldn't get an answer.");
  buddyResponse.textContent=result.answer;
  history.push({role:"user",text:message},{role:"model",text:result.answer});
  history=history.slice(-8);
 }catch(error){buddyResponse.textContent="💗 "+(error.message||"Something went wrong. Try again.")}
 finally{busy=false;button.disabled=false}
}
document.querySelectorAll("[data-prompt]").forEach(btn=>btn.addEventListener("click",()=>{
 const prompts={motivate:"Give me some motivation to study right now.",plan:"Make a simple 25-minute study plan for "+($("buddyInput").value.trim()||"my next study session")+".",break:"Suggest a relaxing 5-minute study break.",progress:"I completed "+data.sessions+" focus sessions, studied "+data.minutes+" minutes, and earned "+data.carrots+" carrots. Celebrate my progress and suggest my next step."};
 void askBuddy(prompts[btn.dataset.prompt]);
}));
$("buddyForm").addEventListener("submit",event=>{event.preventDefault();const message=$("buddyInput").value.trim();if(message)void askBuddy(message)});
