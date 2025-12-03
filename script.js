import { CreateMLCEngine } from "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm";
const overlay=document.getElementById("overlay");
const app=document.getElementById("app");
const statusText=document.getElementById("status-text");
const progressFill=document.getElementById("progress-fill");
const progressPercent=document.getElementById("progress-percent");
const codeInput=document.getElementById("code-input");
const languageSelect=document.getElementById("language-select");
const debugBtn=document.getElementById("debug-btn");
const output=document.getElementById("output");
const analyzing=document.getElementById("analyzing");
let engine=null;
function setProgress(value){const pct=Math.max(0,Math.min(100,Math.round(value)));progressFill.style.width=`${pct}%`;progressPercent.textContent=`${pct}%`;statusText.textContent=`Loading ${pct}%`}
async function initialize(){debugBtn.disabled=true;languageSelect.disabled=true;codeInput.disabled=true;engine=await CreateMLCEngine({model:"local-debugger",model_list:[{model_url:"./model",model_id:"local-debugger",model_name:"Local Debugger"}]},{initProgressCallback:info=>{if(typeof info.progress==='number')setProgress(info.progress*100);if(info.progress===1){statusText.textContent="Model ready";}}});statusText.textContent="Ready";setProgress(100);overlay.style.display="none";app.style.visibility="visible";debugBtn.disabled=false;languageSelect.disabled=false;codeInput.disabled=false}
function createOutputEntry(initial=""){const entry=document.createElement("div");entry.className="output-entry";entry.textContent=initial;output.appendChild(entry);output.scrollTop=output.scrollHeight;return entry}
function toggleInteraction(disabled){codeInput.disabled=disabled;languageSelect.disabled=disabled;debugBtn.disabled=disabled;analyzing.classList.toggle("active",disabled)}
debugBtn.addEventListener("click",async()=>{const code=codeInput.value.trim();if(!code||!engine)return;toggleInteraction(true);const entry=createOutputEntry("— New Analysis —\n");const prompt=`You are a local offline code-debugging AI. Analyze the following code. Identify bugs. Explain the problems. Provide corrected code. Respond in plain text.\nLanguage: ${languageSelect.value}\nCode:\n\n${code}`;let result="";try{const completion=await engine.chat.completions.create({messages:[{role:"user",content:prompt}],temperature:0.2,stream:true});for await (const chunk of completion){const delta=chunk.choices?.[0]?.delta?.content||"";if(delta){result+=delta;entry.textContent=`— New Analysis —\n${result}`;output.scrollTop=output.scrollHeight;}}}catch(e){entry.textContent="Error: "+(e.message||e.toString());}finally{toggleInteraction(false);output.scrollTop=output.scrollHeight;}});
codeInput.addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="enter"){e.preventDefault();debugBtn.click();}});
codeInput.placeholder=`Paste your code here...\n\nfunction example(){\n  console.log('Hello, debugger');\n}`;
app.style.visibility="hidden";
initialize();
