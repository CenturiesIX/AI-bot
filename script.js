import * as webllm from "https://esm.run/@mlc-ai/web-llm";

const messagesContainer=document.getElementById("messages");
const input=document.getElementById("user-input");
const sendBtn=document.getElementById("send-btn");
const status=document.getElementById("status");
const loadingScreen=document.getElementById("loading-screen");
const thinking=document.getElementById("thinking");

let engine=null;
let conversation=[{role:"system",content:"You are a helpful AI assistant."}];

function appendMessage(text,role){const bubble=document.createElement("div");bubble.className=`message ${role}`;bubble.textContent=text;messagesContainer.appendChild(bubble);messagesContainer.scrollTop=messagesContainer.scrollHeight;}

function setThinking(visible){thinking.classList.toggle("visible",visible);}

function resizeInput(){input.style.height="auto";input.style.height=`${input.scrollHeight}px`;}

function setReady(){loadingScreen.classList.add("hidden");sendBtn.disabled=false;input.disabled=false;status.textContent="Model ready";}

async function initModel(){sendBtn.disabled=true;input.disabled=true;status.textContent="Loading model";const modelId="local-webllm";const initOptions={appConfig:{model_list:[{model:modelId,model_url:"./model/"}]},initProgressCallback:(p)=>{status.textContent=p.text||`Loading ${Math.round(p.progress*100)}%`;}};engine=await webllm.CreateMLCEngine(modelId,initOptions);setReady();}

async function generateReply(){const userText=input.value.trim();if(!userText||!engine)return;appendMessage(userText,"user");conversation.push({role:"user",content:userText});input.value="";resizeInput();sendBtn.disabled=true;setThinking(true);try{const completion=await engine.chat.completions.create({messages:conversation,stream:false});const reply=completion.choices[0].message.content;conversation.push({role:"assistant",content:reply});appendMessage(reply,"bot");}catch(err){appendMessage("Unable to generate a response.","bot");}finally{sendBtn.disabled=false;input.focus();setThinking(false);} }

sendBtn.addEventListener("click",generateReply);
input.addEventListener("input",resizeInput);
input.addEventListener("keydown",(e)=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();generateReply();}});

initModel();
