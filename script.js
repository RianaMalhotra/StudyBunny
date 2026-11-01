const $=id=>document.getElementById(id);
const url=window.STUDYBUNNY_SUPABASE_URL,key=window.STUDYBUNNY_SUPABASE_KEY;
const configured=url&&!url.startsWith("YOUR_")&&key&&!key.startsWith("YOUR_");
const db=configured&&window.supabase?window.supabase.createClient(url,key):null;
let user=null,data={sessions:0,carrots:0,minutes:0};
let focus=true,running=false,remaining=1500,endAt=0,tickId=null;
function status(message){$("authMessage").textContent=message}
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
async function save(){
 if(!user)return;
 const {error}=await db.from("bunny_progress").upsert({user_id:user.id,...data,updated_at:new Date().toISOString()},{onConflict:"user_id"});
 if(error)$("message").textContent="Couldn't sync progress. Check your connection ♡";
}
function finish(){
 stop();
 if(focus){data.sessions++;data.carrots+=2;data.minutes+=25;void save();$("message").textContent="You deserve a treat! +2 carrots 🥕💗";focus=false;remaining=300}
 else{$("message").textContent="All refreshed! Your bunny is cheering you on 🌸";focus=true;remaining=1500}
 startTimer();
}
function tick(){remaining=Math.max(0,Math.ceil((endAt-Date.now())/1000));if(remaining===0)finish();else render()}
$("start").onclick=()=>{if(running){tick();if(running)stop()}else startTimer();render()};
$("reset").onclick=()=>{stop();focus=true;remaining=1500;render()};
async function showUser(nextUser){
 stop();user=nextUser;focus=true;remaining=1500;
 $("authPanel").hidden=!!user;$("appContent").hidden=!user;
 if(!user){data={sessions:0,carrots:0,minutes:0};render();return}
 $("accountEmail").textContent="💗 "+user.email;
 const {data:row,error}=await db.from("bunny_progress").select("sessions,carrots,minutes").eq("user_id",user.id).maybeSingle();
 if(user.id!==nextUser.id)return;
 if(error){$("message").textContent="Unable to load your progress. Please reload ♡";return}
 data=row?{sessions:row.sessions,carrots:row.carrots,minutes:row.minutes}:{sessions:0,carrots:0,minutes:0};
 render();
}
$("authForm").onsubmit=async e=>{
 e.preventDefault();if(!db)return status("Set up Supabase first ♡");
 status("Logging in...");
 const {error}=await db.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});
 status(error?error.message:"Welcome back! 💗");
};
$("signupBtn").onclick=async()=>{
 if(!db)return status("Set up Supabase first ♡");
 if(!$("authForm").reportValidity())return;
 status("Creating your account...");
 const {data:result,error}=await db.auth.signUp({email:$("email").value.trim(),password:$("password").value,options:{emailRedirectTo:"https://rianamalhotra.github.io/StudyBunny/"}});
 status(error?error.message:result.session?"Welcome to StudyBunny! 🐰":"Check your email to confirm your account 💌");
};
$("logoutBtn").onclick=async()=>{stop();if(db)await db.auth.signOut();await showUser(null);status("Logged out ♡")};
async function init(){
 render();
 if(!db){status("Setup needed: add Supabase URL and publishable key to config.js ♡");return}
 db.auth.onAuthStateChange((_event,session)=>{void showUser(session?.user||null)});
 const {data:sessionData,error}=await db.auth.getSession();
 if(error)status(error.message);
 else await showUser(sessionData.session?.user||null);
}
void init();
