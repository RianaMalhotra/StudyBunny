// Deploy as a Cloudflare Worker. Set GEMINI_API_KEY as an encrypted Worker secret.
// Set up a Cloudflare WAF rate limiting rule for /chat before making this public.
const ORIGIN="https://rianamalhotra.github.io";
const headers={"Access-Control-Allow-Origin":ORIGIN,"Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type","Content-Type":"application/json","Cache-Control":"no-store"};
const respond=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers});
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(url.pathname!=="/chat")return respond({error:"Not found"},404);
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(request.method!=="POST")return respond({error:"Method not allowed"},405);
 if(request.headers.get("Origin")!==ORIGIN)return respond({error:"Origin not allowed"},403);
 if(!env.GEMINI_API_KEY)return respond({error:"Backend API key is not configured"},503);
 if(Number(request.headers.get("content-length")||0)>12000)return respond({error:"Request too large"},413);
 let body;
 try{body=await request.json()}catch{return respond({error:"Invalid JSON"},400)}
 const message=body?.message;
 if(typeof message!=="string"||!message.trim()||message.length>2000)return respond({error:"Ask a question under 2000 characters"},400);
 const history=Array.isArray(body.history)?body.history.slice(-8).filter(x=>x&&["user","model"].includes(x.role)&&typeof x.text==="string"&&x.text.length<=2000):[];
 const contents=[...history.map(x=>({role:x.role,parts:[{text:x.text}]})),{role:"user",parts:[{text:message}]}];
 try{
 const response=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":env.GEMINI_API_KEY},body:JSON.stringify({systemInstruction:{parts:[{text:"You are Bunny Buddy, a friendly, accurate, concise study assistant in the pastel StudyBunny app. Answer any appropriate question directly, explain math and code step by step when requested, and acknowledge uncertainty. Keep cute language light and do not overuse emojis."}]},contents,generationConfig:{maxOutputTokens:700,temperature:0.65}})});
 const result=await response.json();
 if(!response.ok)return respond({error:response.status===429?"Bunny Buddy is busy or the free AI quota was reached. Try again later.":"The AI provider couldn't answer right now."},response.status===429?429:502);
 const answer=result?.candidates?.[0]?.content?.parts?.map(x=>x.text||"").join("").trim();
 return answer?respond({answer}):respond({error:"No answer returned. Try rephrasing."},502);
 }catch{return respond({error:"Connection to the AI provider failed."},502)}
}};