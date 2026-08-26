
import { AwlaV3 } from "../app.js";
const seed=await fetch("../../data/demo-state.json").then(r=>r.json());
let app=new AwlaV3(seed);
const $=s=>document.querySelector(s);
function render(){
 $("#skus").textContent=app.state.skus.length;
 $("#units").textContent=app.state.contentUnits.length;
 $("#blocked").textContent=app.state.contentUnits.filter(x=>x.executionGraph?.status==="BLOCKED").length;
 $("#brand").innerHTML=`<b>${app.state.brand.name}</b><p class="muted">${app.state.brand.market} · ${app.state.brand.category} · ${app.state.brand.objective}</p>`;
 $("#skuList").innerHTML=app.state.skus.map(x=>`<p><b>${x.name}</b> <span class="muted">${x.metal} · ${x.references.length} refs · ${x.immutableRules.length} identity rules</span></p>`).join("");
 $("#graphs").innerHTML=app.state.contentUnits.map(u=>{const sku=app.state.skus.find(s=>s.id===u.skuId);return `<tr><td>${u.id.slice(0,8)}</td><td>${sku?.name||"-"}</td><td>${u.creativeType}</td><td>${u.executionGraph?.nodes.length||0}</td><td class="${u.executionGraph?.status==="READY"?"ok":"warn"}">${u.executionGraph?.status||"NOT BUILT"}</td></tr>`}).join("");
 const checks=[
  ["Brand Brain",!!app.state.brand.name],["3 benchmark SKUs",app.state.skus.length>=3],
  ["Campaign planned",app.state.campaigns.length>0],["Execution graphs",app.state.contentUnits.every(x=>x.executionGraph)]
 ];
 $("#gates").innerHTML=checks.map(x=>`<p class="${x[1]?"ok":"warn"}">${x[1]?"✓":"!"} ${x[0]}</p>`).join("");
}
$("#build").onclick=()=>{if(!app.state.campaigns.length)app.createCampaign();render()};
$("#reset").onclick=()=>{app=new AwlaV3(seed);render()};
render();
