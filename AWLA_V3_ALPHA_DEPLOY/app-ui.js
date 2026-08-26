import { AwlaV3 } from "./src/app.js";
import { createRuntime } from "./src/runtime.js";
import { extractProduct, compositeProduct } from "./src/core/product-lock.js";

const seed=await fetch("./data/demo-state.json").then(r=>r.json());
let app=new AwlaV3(seed), campaign=null, selectedUnit=null, productDataUrl="", finalCanvas=null;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function render(){
 $("#mSku").textContent=app.state.skus.length;$("#mUnits").textContent=app.state.contentUnits.length;
 $("#mNodes").textContent=app.state.contentUnits.reduce((s,u)=>s+(u.executionGraph?.nodes.length||0),0);
 $("#mQc").textContent=app.state.contentUnits.filter(u=>u.qc?.decision==="PASS").length;
 $("#brandName").textContent=app.state.brand.name;$("#brandMeta").textContent=`${app.state.brand.market} · ${app.state.brand.category}`;$("#brandObjective").textContent=app.state.brand.objective;
 $("#skuList").innerHTML=app.state.skus.map(s=>`<div class="sku ${selectedUnit?.skuId===s.id?"selected":""}"><b>${s.name}</b><div class="muted">${s.metal} · ${s.references.length} refs · ${s.immutableRules.length} lock rules</div></div>`).join("");
 $("#units").innerHTML=app.state.contentUnits.length?app.state.contentUnits.map(u=>{const s=app.state.skus.find(x=>x.id===u.skuId);return `<div class="card unit"><span class="badge">${u.role}</span><h3>${s?.name||"-"}</h3><div class="muted">${u.creativeType} · ${u.format}</div><div class="graph">${(u.executionGraph?.nodes||[]).map(n=>`<span class="node">${n.capability}</span>`).join("")}</div><button class="btn primary" data-unit="${u.id}">Open execution</button></div>`}).join(""):`<p class="muted">اضغط Build Campaign.</p>`;
 $$("[data-unit]").forEach(b=>b.onclick=()=>openUnit(b.dataset.unit));
 $("#graphRows").innerHTML=app.state.contentUnits.map(u=>{const s=app.state.skus.find(x=>x.id===u.skuId);return `<tr><td>${u.id.slice(0,8)}</td><td>${s?.name||"-"}</td><td>${u.creativeType}</td><td>${(u.executionGraph?.nodes||[]).map(n=>n.capability).join(" → ")}</td><td>${u.executionGraph?.status||"-"}</td></tr>`}).join("");
}
function build(){if(!app.state.campaigns.length)campaign=app.createCampaign();else campaign=app.state.campaigns[0];render()}
function openUnit(id){selectedUnit=app.state.contentUnits.find(x=>x.id===id);$("#studio").classList.remove("hidden");const sku=app.state.skus.find(x=>x.id===selectedUnit.skuId);$("#studioTitle").textContent=`${sku.name} · ${selectedUnit.role}`;$("#studioBrief").textContent=selectedUnit.visualBrief;productDataUrl="";$("#productFile").value="";$("#run").disabled=true;$("#download").disabled=true;clearCanvas();$("#studio").scrollIntoView({behavior:"smooth"});render()}
function clearCanvas(){const c=$("#canvas"),x=c.getContext("2d");x.fillStyle="#e7e3da";x.fillRect(0,0,c.width,c.height);x.fillStyle="#617174";x.font="24px Arial";x.textAlign="center";x.fillText("AWLA Product Lock Preview",512,512)}
$("#productFile").onchange=e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{productDataUrl=r.result;$("#run").disabled=false;preview(productDataUrl)};r.readAsDataURL(f)};
function preview(src){const im=new Image();im.onload=()=>{const c=$("#canvas"),x=c.getContext("2d");x.fillStyle="#e7e3da";x.fillRect(0,0,1024,1024);const s=Math.min(820/im.width,820/im.height),w=im.width*s,h=im.height*s;x.drawImage(im,(1024-w)/2,(1024-h)/2,w,h)};im.src=src}
function prog(v,t){$("#progress").style.width=v+"%";$("#status").textContent=t}
$("#run").onclick=async()=>{
 if(!selectedUnit||!productDataUrl)return;const sku=app.state.skus.find(x=>x.id===selectedUnit.skuId);
 try{
  $("#run").disabled=true;prog(10,"Product Identity Lock: extracting original SKU…");
  const product=await extractProduct(productDataUrl,{tolerance:+$("#tolerance").value});
  prog(30,`Product mask OK · ${(product.foregroundRatio*100).toFixed(1)}% foreground. Generating environment…`);
  const worker=$("#workerUrl").value.trim();const runtime=createRuntime({workerUrl:worker});
  const native=runtime.adapters["awla-native"];
  const envRes=await native.generateEnvironment({prompt:selectedUnit.visualBrief+" Environment only. Absolutely no jewelry/product/text/logo in generated image. Leave deliberate empty placement area.",engine:"dev"});
  const env=await createImageBitmap(envRes.blob);prog(72,"Compositing exact product pixels…");
  finalCanvas=compositeProduct({environment:env,product,shadow:.28});
  const c=$("#canvas"),x=c.getContext("2d");x.clearRect(0,0,1024,1024);x.drawImage(finalCanvas,0,0);
  const result=app.evaluateUnit(selectedUnit.id,{productLock:true,artifactFree:true});
  prog(100,`QC ${result.qc.score}/100 · ${result.gate.state}`);$("#download").disabled=false;render();
 }catch(e){console.error(e);prog(0,"Failed: "+e.message);alert("Execution failed: "+e.message)}
 finally{$("#run").disabled=false}
};
$("#download").onclick=()=>{if(!finalCanvas)return;finalCanvas.toBlob(b=>{const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="AWLA-"+(selectedUnit?.id||"creative")+".png";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)},"image/png")};
$("#buildCampaign").onclick=build;$("#reset").onclick=()=>{app=new AwlaV3(seed);campaign=null;selectedUnit=null;$("#studio").classList.add("hidden");render()};
$$("[data-view]").forEach(b=>b.onclick=()=>{$$("[data-view]").forEach(x=>x.classList.remove("active"));b.classList.add("active");$$(".view").forEach(v=>v.classList.remove("active"));$("#"+b.dataset.view).classList.add("active")});
$("#health").onclick=async()=>{const s=$("#healthStatus");s.textContent="Testing…";try{const r=await fetch($("#workerUrl").value.replace(/\/$/,"")+"/health");const j=await r.json();s.textContent=j.ok?`Connected ✓ · ${j.model||j.service||"AWLA AI"}`:"Unexpected response"}catch(e){s.textContent="Failed: "+e.message}};
clearCanvas();render();
