
import test from "node:test";
import assert from "node:assert/strict";
import { AwlaV3 } from "../src/app.js";
import { CREATIVE_TYPES } from "../src/core/capabilities.js";
import fs from "node:fs";

const seed=JSON.parse(fs.readFileSync(new URL("../data/demo-state.json",import.meta.url),"utf8"));

test("campaign planning creates units and graphs",()=>{
  const app=new AwlaV3(seed);
  const c=app.createCampaign();
  assert.equal(c.contentUnitIds.length,3);
  for(const id of c.contentUnitIds){
    const u=app.state.contentUnits.find(x=>x.id===id);
    assert.ok(u.executionGraph);
    assert.equal(u.executionGraph.status,"READY");
  }
});

test("product hero graph contains product lock",()=>{
  const app=new AwlaV3(seed);
  const c=app.createCampaign();
  const u=app.state.contentUnits.find(x=>x.id===c.contentUnitIds[0]);
  assert.equal(u.creativeType,CREATIVE_TYPES.PRODUCT_HERO);
  assert.ok(u.executionGraph.nodes.some(n=>n.capability==="PRODUCT_LOCK"));
});

test("QC blocks output without product lock",()=>{
  const app=new AwlaV3(seed);
  const c=app.createCampaign();
  const id=c.contentUnitIds[0];
  const r=app.evaluateUnit(id,{productLock:false,artifactFree:true});
  assert.equal(r.qc.decision,"FAIL");
  assert.equal(r.gate.state,"BLOCKED");
});

test("QC passes strong product-locked output",()=>{
  const app=new AwlaV3(seed);
  const c=app.createCampaign();
  const id=c.contentUnitIds[0];
  const r=app.evaluateUnit(id,{productLock:true,artifactFree:true});
  assert.equal(r.qc.decision,"PASS");
  assert.ok(["READY_FOR_APPROVAL","REVIEW"].includes(r.gate.state));
});

test("cost estimate is finite and positive", async()=>{
  const { estimateGraphCost } = await import("../src/core/model-intelligence.js");
  const { defaultProviders } = await import("../src/core/router.js");
  const app=new AwlaV3(seed);const c=app.createCampaign();
  const u=app.state.contentUnits.find(x=>x.id===c.contentUnitIds[0]);
  const est=estimateGraphCost(u.executionGraph,defaultProviders());
  assert.ok(est.total>0);
});

test("runtime graph provider ids have matching local adapters for native Alpha", async()=>{
  const { createRuntime } = await import("../src/runtime.js");
  const { defaultProviders } = await import("../src/core/router.js");
  const runtime=createRuntime();
  const localIds=new Set(Object.keys(runtime.adapters));
  for(const p of defaultProviders()){
    assert.ok(localIds.has(p.id),`missing adapter ${p.id}`);
  }
});

test("cost guard blocks over-budget graph", async()=>{
  const { enforceBudget }=await import("../src/core/cost-guard.js");
  const r=enforceBudget({graph:{},estimate:{total:99},mode:"BALANCED"});
  assert.equal(r.allowed,false);
});

test("tool hub keeps exact jewelry hero on Product Lock path", async()=>{
  const { chooseToolForIntent }=await import("../src/core/tool-hub.js");
  const { defaultProviders }=await import("../src/core/router.js");
  const providers=defaultProviders();
  const r=chooseToolForIntent({intent:"EXACT_JEWELRY_HERO",providers,connections:[]});
  assert.equal(r.productLock.id,"product-lock");
  assert.equal(r.environment.id,"awla-native");
});
