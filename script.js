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
let sparkleAudio;
function enableSparkle(){
  const AudioClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioClass) return;
  sparkleAudio ||= new AudioClass();
  if (sparkleAudio.state === 'suspended') sparkleAudio.resume();
}
function playSparkle(){
  if (!sparkleAudio || sparkleAudio.state !== 'running') return;
  const now = sparkleAudio.currentTime;
  [784,1046.5,1318.5,1760].forEach((frequency,i)=>{
    const osc=sparkleAudio.createOscillator();
    const volume=sparkleAudio.createGain();
    const start=now+i*0.12;
    osc.type='sine';
    osc.frequency.setValueAtTime(frequency,start);
    volume.gain.setValueAtTime(0.0001,start);
    volume.gain.exponentialRampToValueAtTime(0.08,start+0.02);
    volume.gain.exponentialRampToValueAtTime(0.0001,start+0.45);
    osc.connect(volume);
    volume.connect(sparkleAudio.destination);
    osc.start(start);
    osc.stop(start+0.46);
  });
}
function finish(){
 playSparkle();
 stop();
 if(focus){data.sessions++;data.carrots+=2;data.minutes+=25;save();$("message").textContent="You deserve a treat! +2 carrots 🥕💗";focus=false;remaining=300}
 else{$("message").textContent="All refreshed! Your bunny is cheering you on 🌸";focus=true;remaining=1500}
 startTimer();
}
function tick(){remaining=Math.max(0,Math.ceil((endAt-Date.now())/1000));if(remaining===0)finish();else render()}
$("start").onclick=()=>{enableSparkle();if(running){tick();if(running)stop()}else{playSparkle();startTimer()}render()};
$("reset").onclick=()=>{stop();focus=true;remaining=1500;render()};
render();



const buddyResponse=$("buddyResponse");
const bunnyAnswers={
 motivate:["You've got this, sunshine! Just one tiny step at a time. 🌸","Your bunny believes in you, even on the hard days. 💗","You don't need to be perfect, just keep hopping forward! 🐰","Future you is cheering for every minute you spend trying. 🎀"],
 plan:["Pick one small goal, study for 25 minutes, then take a 5-minute break. Repeat! 📚","Try this: 5 minutes reviewing notes, 15 minutes practicing, 5 minutes recalling without looking. ✨","Choose your hardest little task first, then reward yourself with a bunny break. 🥕"],
 break:["Stretch, drink water, and rest your eyes for five minutes! 🍓","Walk around, breathe slowly, and come back refreshed. 🌷","Grab a cozy drink and listen to one favorite song. 💗","Do a tiny dance break! Bunny approves. 🐰"],
 progress:[],
 focus:["Put your phone away, choose one task, and press Start focusing. ♡","Try the two-minute rule: promise yourself just two minutes, then keep going if you can. 🌼","Close extra tabs and write one clear goal for this session. 🎀"],
 stuck:["It's okay to feel stuck. Start with the easiest question to build momentum. 💕","Break the problem into tiny pieces and solve just the first one. 🧩","Explain what you know out loud like you're teaching Bunny Buddy. 🐰"],
 exam:["Practice questions are your best friend! Test yourself before checking the answers. 📝","Make a tiny formula sheet from memory, then check what you missed. ✨","Study in short rounds and focus extra on mistakes you've made before. 🌷"],
 celebrate:["You're doing amazing, little superstar! ✨","Bunny is sending you the biggest virtual hug! 🐰💗","Every carrot counts, and so does every effort you make. 🥕"]
};
let lastAnswer={};
function bunnyReply(type){
 let answers=bunnyAnswers[type];
 if(type==="progress")answers=[
 "You've earned "+data.carrots+" carrots and completed "+data.sessions+" sessions. Bunny is proud! 🥕",
 "Look at you! "+data.minutes+" focused minutes and counting. Keep blooming! 🌸",
 "Your bunny has "+data.carrots+" carrots thanks to your hard work. So sweet! 💗"
 ];
 if(!answers||!answers.length)return;
 let choices=answers.map((_,i)=>i).filter(i=>i!==lastAnswer[type]);
 if(!choices.length)choices=answers.map((_,i)=>i);
 const index=choices[Math.floor(Math.random()*choices.length)];
 lastAnswer[type]=index;
 buddyResponse.textContent=answers[index];
 const bunny=$("bunny");
 bunny.classList.remove("happy-hop");
 void bunny.offsetWidth;
 bunny.classList.add("happy-hop");
}
document.querySelectorAll("[data-prompt]").forEach(btn=>btn.addEventListener("click",()=>bunnyReply(btn.dataset.prompt)));

$("readyBtn").addEventListener("click",()=>{enableSparkle();
 $("welcomePage").hidden=true;
 $("studyPage").hidden=false;
 window.scrollTo({top:0,behavior:"instant"});
});
