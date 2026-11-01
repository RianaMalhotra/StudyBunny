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
const motivation=["You don't have to finish everything today. Just start with one tiny task, cutie! 💗","Your future self is going to be so proud of this little study session. 🌷","A little progress is still progress. Your bunny is rooting for you! 🐰","One page, one problem, one carrot at a time! 🥕"];
function buddyReply(type,topic=""){
 const clean=topic.trim().slice(0,140);
 const label=clean||"your next study task";
 let reply="";
 if(type==="motivate")reply=motivation[Math.floor(Math.random()*motivation.length)];
 else if(type==="plan")reply="Let's tackle "+label+"! 🎀 ① Spend 5 minutes choosing one small goal. ② Focus for 25 minutes on that goal. ③ Take your 5-minute treat break. ④ Check what you learned and repeat. ♡";
 else if(type==="break")reply="Treat time! 🍓 Stretch your shoulders, sip some water, look away from the screen, and give your bunny a little smile. ♡";
 else if(type==="progress")reply="You've finished "+data.sessions+" focus sessions, studied "+data.minutes+" minutes, and earned "+data.carrots+" carrots! 🥕 Every little win counts.";
 else if(/stress|overwhelm|anxious|tired|can't focus|cant focus/i.test(clean))reply="Sounds like a lot, sweetie. 💗 Try writing down just one tiny next step for "+label+". A short rest is okay too. You don't need to do everything at once.";
 else reply="Let's make "+label+" feel manageable! 🌸 Write down the first question or section, focus on it for 25 minutes, then explain what you learned in 2 sentences. You've got this! ♡";
 buddyResponse.textContent=reply;
}
document.querySelectorAll("[data-prompt]").forEach(btn=>btn.addEventListener("click",()=>buddyReply(btn.dataset.prompt,$("buddyInput").value)));
$("buddyForm").addEventListener("submit",event=>{event.preventDefault();buddyReply("topic",$("buddyInput").value)});
