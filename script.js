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
